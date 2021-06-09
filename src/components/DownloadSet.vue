<template>
  <q-dialog v-model="sliders">
    <q-card style="width: 300px" class="q-px-sm q-pb-md">
      <q-card-section>
        <div class="text-h6">下载设置</div>
      </q-card-section>

      <q-item-label header>同时下载数</q-item-label>
      <q-item dense>
        <q-item-section>
          <q-input outlined v-model="maxDownload" label="同时下载数" />
        </q-item-section>
      </q-item>
      <q-item-label header>下载地址</q-item-label>
      <q-item dense>
        <q-item-section>
          <q-input filled bottom-slots v-model="downloadPath" label="下载地址" >
            <template v-slot:append>
              <q-btn round dense flat icon="create_new_folder" @click="clickPath"/>
            </template>
          </q-input>
          <input type="file" id="file" hidden @change="fileChange" webkitdirectory>
        </q-item-section>
      </q-item>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="关闭" v-close-popup/>
        <q-btn flat label="保存" @click="saveDownloadSet" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'DownloadSet',
  data() {
    return {
      sliders: false,
      maxDownload: 10,
      downloadPath: '',
      store: null
    }
  },
  created() {
    /***
     * 加载下载设置
     * @type {ElectronStore}
     */
    const Store = require('electron-store');
    this.store = new Store();
    let maxDownload = this.store.get('maxDownload')
    if( maxDownload === undefined) {
      this.store.set('maxDownload',10);
      this.maxDownload = 10
    }else {
      this.maxDownload = maxDownload
    }

    require('electron').ipcRenderer.on('open-download-set', (event, message) => {
      this.maxDownload = this.store.get('maxDownload')
      this.downloadPath = this.store.get('downloadPath')
      this.sliders = true
    })
  },
  methods: {
    saveDownloadSet() {
      this.store.set('maxDownload',this.maxDownload)
      this.store.set('downloadPath',this.downloadPath)
      this.sliders = false
    },
    fileChange() {
      try {
        const fu = document.getElementById('file')
        if (fu == null) return
        this.downloadPath = fu.files[0].path
      } catch (error) {
        console.debug('choice file err:', error)
      }
    },
    clickPath() {
      let _that = this
      const {ipcRenderer} = require('electron')
      ipcRenderer.send('changePath')
      ipcRenderer.on('path-result', (event, message) => {
        _that.downloadPath = message

      })
      // path-result
    }
  }
};
</script>

<style scoped>

</style>
