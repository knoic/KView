<template>
  <q-list style="">
    <q-item clickable v-for="(item,index) in downloadArr" :key="index" style="background: #ffffff;">
      <q-item-section avatar>
        <q-circular-progress
          show-value
          font-size="10px"
          class="q-ma-md"
          :value="item.process"
          size="50px"
          :thickness="0.2"
          color="primary"
          track-color="grey-3"
        >
          <q-avatar size="48px">
            <q-img :src="item.preview_url" style="height: 50px"/>
          </q-avatar>
        </q-circular-progress>
      </q-item-section>
      <q-item-section class="download-info">
        <p>
          author:{{item.author}}
        </p>
      </q-item-section>
      <q-item-section class="download-info">
        <div>
          <q-btn unelevated round color="primary" icon="play_arrow" size="small" v-if="item.state === 'pause'"/>
          <q-btn unelevated round color="primary" icon="pause" size="small" v-if="item.state === 'progressing'" @click="pauseDownload(item)"/>
          <q-btn unelevated round color="primary" icon="folder_open" size="small" v-if="item.state === 'completed'" @click="openFile"/>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  name: 'DownloadList',
  data() {
    return {
      store: null
    }
  },
  model: {
    prop: 'downloadArr',
    event: 'change'
  },
  props: {
    downloadArr: Array
  },
  created() {
    const Store = require('electron-store');
    this.store = new Store();
  },
  watch: {
    // downLoadList(newVAl) {
    //   this.$emit('change', newVAl)
    //   this.store.set('downLoadList',this.downLoadList)
    // },
    downloadArr: {
      handler(newValue, oldValue) {
        this.$emit('change', newValue)
        this.store.set('downloadArr',this.downloadArr)
      },
      deep: true
    }
  },
  methods: {
    /***
     * 打开已完成下载的文件
     */
    openFile() {
      console.log('打开文件');
    },
    /***
     * 继续下载
     */
    resumeDownload(item) {
      require('electron').ipcRenderer.send(item.ETag+'resume')
    },
    /***
     * 暂停下载
     */
    pauseDownload(item) {
      require('electron').ipcRenderer.send(item.ETag+'pause')
    },
  }
};
</script>

<style scoped>
.my-card{
  box-sizing: border-box;
}
.download-info{
  font-size: 12px;
  text-overflow:ellipsis
}
.q-item__section--side{
  padding-right: 0px;
}
.q-item{
  padding: 0px;
}
</style>
