<template>
  <q-dialog v-model="sliders">
    <q-card style="width: 300px" class="q-px-sm q-pb-md">
      <q-card-section>
        <div class="text-h6">通用设置</div>
      </q-card-section>

      <q-item-label header>下载并发数</q-item-label>
      <q-item dense>
        <q-item-section>
          <q-input outlined v-model="maxDownload" label="下载并发数" />
        </q-item-section>
      </q-item>
      <q-item-label header>预览并发数</q-item-label>
      <q-item dense>
        <q-item-section>
          <q-input outlined v-model="maxPreview" label="预览并发数" />
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
      maxPreview: 10,
      downloadPath: '',
      store: null
    }
  },
  created() {
    /***
     * 加载设置
     * @type {ElectronStore}
     */
    const Store = require('electron-store');
    this.store = new Store();

    require('electron').ipcRenderer.on('open-download-set', (event, message) => {
      this.maxDownload = this.store.get('maxDownload')
      this.downloadPath = this.store.get('downloadPath')
      this.maxPreview = this.store.get('maxPreview')
      this.sliders = true
    })
  },
  methods: {
    saveDownloadSet() {
      this.store.set('maxDownload',this.maxDownload)
      this.store.set('downloadPath',this.downloadPath)
      this.store.set('maxPreview',this.maxPreview)
      this.sliders = false
    },
    /***
     * 点选下载路径
     */
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
