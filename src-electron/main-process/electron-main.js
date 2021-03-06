import { app, BrowserWindow, nativeTheme } from 'electron'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })
  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  const path = require('path')

  /***
   * start
   * 下载进度监听
   */
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const Store = require('electron-store');
    const store = new Store();
    let filePath;
    if(store.get('downloadPath') === undefined) {
      filePath = path.join(app.getPath('downloads'), item.getFilename());
    }else {
      filePath = path.join(store.get('downloadPath'), item.getFilename());
    }
    console.log('DownloadItem',item);
    const { ipcMain } = require("electron");
    // 下载暂停
    ipcMain.on(item.getETag()+'pause',(event,data) => {
      console.log('下载暂停');
      item.pause()
    })
    // 下载恢复
    ipcMain.on(item.getETag()+'resume',(event,data) => {
      console.log('下载恢复');
      item.resume()
    })
    item.setSavePath(filePath);
    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        if (item.isPaused()) {
          mainWindow.webContents.send('down-is-paused', {
            // item: item,
            name: item.getFilename(),
            url: item.getURL(),
            ETag: item.getETag(),
            state: 'paused'
          })
        }else {
          mainWindow.webContents.send('down-process', {
            // item: item,
            name: item.getFilename(),
            url: item.getURL(),
            receive: item.getReceivedBytes(),
            total: item.getTotalBytes(),
            ETag: item.getETag(),
            state: state
          })
        }
      }
      else if (state === 'interrupted') {
      }
      else {
      }
    });
    item.once('done', (event, state) => {
      console.log('完成',state);
      if (state === 'completed') {

        mainWindow.webContents.send('down-completed', {
          // item: item,
          name: item.getFilename(),
          url: item.getURL(),
          state: state
        })
        //这里是主战场
      } else if (state=="cancelled") {
        //...
      }
      else{
        //...
      }
    })
  })
  /***
   * end
   * 下载进度监听
   */

  setAppMenu()
  setGlobalShortcut()
  loadElectronStore()
  changePath()
}

/***
 * 设置下载路径
 */
function changePath() {
  const { ipcMain } = require("electron");
  ipcMain.on("changePath",(event,data) => {
    const { dialog } = require('electron');
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result=>{
      mainWindow.webContents.send('path-result', result.filePaths[0])
    })
  })
}
/***
 * 设置程序菜单
 */
function setAppMenu() {
  const { app, Menu } = require('electron')
  const isMac = process.platform === 'darwin'
  const template = [
    {
      label: '设置',
      submenu: [
        {
          label: '下载设置',
          click: async () => {
            openDownloadSet()
          }
        },
      ]
    },
    // { role: 'viewMenu' }
    {
      label: '视图',
      submenu: [
        { label: '刷新',role: 'reload'},
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/knoic/KView')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/***
 * 初始化electron-store
 */
function loadElectronStore()  {
  const Store = require('electron-store');
  const store = new Store();
}

/***
 * 初始化electron-store
 */
function openDownloadSet()  {
  mainWindow.webContents.send('open-download-set')
}

function downloadFunction() {
  const { ipcMain } = require("electron");
  ipcMain.on("start-download",(event,data) => {
    console.log(data);
  })
}
/***
 * 设置系统快捷键
 */
function setGlobalShortcut() {
  const { app, globalShortcut } = require('electron')

  app.whenReady().then(() => {
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+A', () => {
      mainWindow.webContents.send('ctrl-a', true)
    })

    if (!ret) {
      console.log('registration failed')
    }
  })

  app.on('will-quit', () => {
    // 注销快捷键
    globalShortcut.unregister('CommandOrControl+X')

    // 注销所有快捷键
    globalShortcut.unregisterAll()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
