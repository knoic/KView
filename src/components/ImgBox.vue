<template>
  <div  class="q-col-gutter-xs">
    <q-infinite-scroll @load="onLoad" :offset="250">
      <div class="row">
        <template v-for="(item,index) in imgObj">
          <div class="my-card col-xs-6 col-sm-4 col-md-2 col-xl-1" :key="index">
            <q-card>
              <q-img :src="item.preview_url" style="width: 1px"/>
              <q-card-actions>
                <q-checkbox size="xs" v-model="selectVal" :val="item"/>
                <q-space />
                <q-btn outline round color="primary" size="sm" icon="remove_red_eye">
                  <q-menu
                    anchor="top right"
                    transition-show="flip-right"
                    transition-hide="flip-left"
                  >
                    <q-card style="max-width: 300px">
                      <q-item>
                        <q-item-section>
                          <q-item-label>
                            <q-chip
                              v-for="(tag, index) in tagsForElement(item.tags)"
                              :key="index" color="teal"
                              dense
                              clickable
                              text-color="white"
                              icon="bookmark"
                              style="cursor: pointer"
                              @click="(evt)=>tagClick(evt,tag)">
                              {{tag}}
                            </q-chip>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-card>
                  </q-menu>
                </q-btn>
                <q-btn outline round color="primary" size="sm" icon="play_for_work" @click="downloadOne(item)"/>
                <!--            <q-linear-progress v-if="item.process !== 0" :value="item.process" class="q-mt-md" />-->
              </q-card-actions>
            </q-card>
          </div>
        </template>
      </div>

    </q-infinite-scroll>

    <q-drawer
      v-model="downloadListDrawer"
      :width="250"
      :breakpoint="500"
      bordered
      content-class="bg-grey-3"
    >
      <q-list style="width: 250px">
        <q-item clickable v-for="(item,index) in downLoadList" :key="index" style="background: #ffffff;">
          <q-item-section avatar>
            <q-circular-progress
              show-value
              font-size="10px"
              class="q-ma-md"
              :value="item.process"
              size="60px"
              :thickness="0.2"
              color="primary"
              track-color="grey-3"
            >
              <q-avatar size="54px">
                <q-img :src="item.preview_url" style="height: 100px"/>
              </q-avatar>
            </q-circular-progress>
          </q-item-section>
          <q-item-section class="download-info">
            <div>
              author:{{item.author}}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </div>
</template>

<script>
import { getBigImg } from 'src/utils/getBigImg';
import eventBus from 'src/utils/eventbus'
import * as async from 'async/index';
import { uuid } from 'vue-uuid';
export default {
  name: 'Index',
  data() {
    return {
      downLoadList: [],
      downloadListDrawer: false,
      value: 0,
      selectVal: [],
      n: 0,
      m: 0,
      store: null,
      viewObj: Array
    };
  },
  computed: {
    tagsForElement() {
      return (data) => {
        return data.split(' ');
      }
    },
  },
  watch:{
    selectVal(newVal) {
    },
    pageSize(newVal) {

    },
    imgObj(newVal) {
      console.log('newVAl');
    }
  },
  props: {
    imgObj: Array
  },
  updated () {
    // console.log('updated');
    // this.$nextTick(()=>{
    //   // 初始化tag库时间较长，避免堵塞
    //   setTimeout(() => {
    //     // require('../utils/dbUtils')
    //     require('../utils/dbByDexie')
    //   },1000)
    // })

  },
  created() {
    const Store = require('electron-store');
    this.store = new Store();
    /***
     * 下载勾选事件
     */
    eventBus.$off("downloadSelect");
    eventBus.$on('downloadSelect', function(data){
      this.downloadImgByMapLimit(this.selectVal)
      this.downloadListDrawer = true
    }.bind(this))
    /***
     * 打开下载列表
     */
    eventBus.$off("downloadDrawerOpen");
    eventBus.$on('downloadDrawerOpen', function(){
      this.downloadListDrawer = !this.downloadListDrawer
    }.bind(this))

    /***
     * 图片全选事件
     */
    eventBus.$off("selectAll");
    eventBus.$on('selectAll', function(data){
      if(data){
        this.imgObj.forEach(item => {
          this.selectVal.push(item)
        })
      }else {
        this.selectVal = []
      }
    }.bind(this))
  },
  methods: {
    /***
     * 图片列表懒加载
     */
    onLoad() {
      console.log('----------到头了----------');
    },
    /***
     * 标签点击方法
     * @param option
     */
    tagClick(evt, tag) {
      eventBus.$emit('tagClick', tag)
    },
    /***
     * 批量下载原图
     * @param option
     */
    downloadImgByMapLimit(option) {
      const mapLimit = require('async/mapLimit')
      let maxDownload = this.store.get('maxDownload') === undefined ? 10 : this.store.get('maxDownload')
      mapLimit(option, maxDownload, this.downloadImgForMap.bind(this), function(err, result){})
    },
    /***
     * 用于批量下载原图的请求方法
     */
    downloadImgForMap(option, callback){
      let  _that = this
      const nameArr = option.file_url.split("/")
      let name = nameArr[nameArr.length-1]
      _that.downLoadList.push(option)
      const { remote } = require('electron')
      let webContents = remote.getCurrentWebContents
      webContents().downloadURL(option.file_url)
      require('electron').ipcRenderer.on('down-process', (event, message) => {
        if(message.name == decodeURI(name)){
          _that.$set(option, 'process' , (message.receive/message.total)*100)
        }
      })
      callback(null)
    },
    /***
     * 单图片下载方法
     */
    downloadOne(item) {
      let  _that = this
      const nameArr = item.file_url.split("/")
      let name = nameArr[nameArr.length-1]
      _that.downLoadList.push(item)
      const { remote } = require('electron')
      let webContents = remote.getCurrentWebContents
      if(item.file_url !== undefined) {
        webContents().downloadURL(item.file_url)
        require('electron').ipcRenderer.on('down-process', (event, message) => {
          if(message.name == decodeURI(name)){
            _that.$set(item, 'process' , (message.receive/message.total)*100)
          }
        })
        require('electron').ipcRenderer.on('down-completed', (event, message) => {
          if(message.name == decodeURI(name)){
            _that.$set(item, 'state' , message.state)
          }
        })
      }
    }
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
</style>
