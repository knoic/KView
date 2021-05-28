<template>
  <div  class="row q-col-gutter-xs">
    <template v-for="(item,index) in imgObj">
      <div class="my-card col-xs-6 col-sm-4 col-md-2 col-xl-1" :key="index">
        <q-card>
          <q-img :src="item.preview_url" style="width: 50px"/>
          <q-card-actions>
            <q-menu
              anchor="top right"
              transition-show="flip-right"
              transition-hide="flip-left"
            >
              <q-list style="min-width: 100px">
                <q-item clickable>
                  <q-item-section>author：{{item.author}}</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>file_size：{{item.file_size}}</q-item-section>
                </q-item>
<!--                <q-separator />-->
                <q-item clickable>
                  <q-item-section>{{item.width}}*{{item.height}}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-checkbox size="xs" v-model="selectVal" :val="item"/>
            <q-space />
            <q-btn outline round color="primary" size="sm" icon="remove_red_eye"/>
            <q-btn outline round color="primary" size="sm" icon="play_for_work" @click="downloadOne(item)"/>
<!--            <q-linear-progress v-if="item.process !== 0" :value="item.process" class="q-mt-md" />-->
          </q-card-actions>
        </q-card>
      </div>
    </template>
    <q-drawer
      v-model="downloadListDrawer"
      :width="250"
      :breakpoint="500"
      bordered
      content-class="bg-grey-3"
    >
      <q-list>
        <q-item clickable v-for="(item,index) in downLoadList" :key="index" style="background: #ffffff;">
          <q-item-section avatar>
            <q-img :src="item.preview_url" style="width: 50px"/>
          </q-item-section>
          <q-item-section class="download-info">
            <div>
              author:{{item.author}}
            </div>
            <q-linear-progress :value="item.process" class="q-mt-md" />
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
    };
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
    console.log('updated');
    this.$nextTick(()=>{
      // 初始化tag库时间较长，避免堵塞
      setTimeout(() => {
        // require('../utils/dbUtils')
        require('../utils/dbByDexie')
      },1000)

    })

  },
  created() {
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
     * 批量下载原图
     * @param option
     */
    downloadImgByMapLimit(option) {
      const mapLimit = require('async/mapLimit')
      mapLimit(option, 30, this.downloadImgForMap.bind(this), function(err, result){})
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
          console.log('匹配');
          _that.$set(option, 'process' , (message.receive/message.total)*100)
        }else {
          console.log('不匹配',message.name, decodeURI(name));
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
            console.log('匹配');
            _that.$set(item, 'process' , (message.receive/message.total)*100)
          }else {
            console.log('不匹配',message.name, decodeURI(name));
          }
        })
      }
    }
  }
};
</script>

<style scoped>
.my-card{
  /*width: 24.5%;*/
  /*float: left;*/
  /*margin: 0.25%;*/
  box-sizing: border-box;
}
.download-info{
  font-size: 18px;
  text-overflow:ellipsis
}
</style>
