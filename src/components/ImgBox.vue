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
      <download-list v-model="downloadArr"></download-list>
    </q-drawer>
  </div>
</template>

<script>
// import { getBigImg } from 'src/utils/getBigImg';
import eventBus from 'src/utils/eventbus'
import DownloadList from 'components/DownloadList';
// import * as async from 'async/index';
// import { uuid } from 'vue-uuid';
export default {
  name: 'Index',
  data() {
    return {
      downloadArr: [],
      downloadListDrawer: false,
      value: 0,
      selectVal: [],
      n: 0,
      m: 0,
      store: null,
      viewObj: Array
    };
  },
  components: {
    DownloadList
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
    this.downloadArr = this.store.get('downloadArr')==undefined?[]:this.store.get('downloadArr')
    console.log('this.downloadArr',this.downloadArr);
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
      _that.downloadArr.push(option)
      const { remote } = require('electron')
      let webContents = remote.getCurrentWebContents
      webContents().downloadURL(option.file_url)
      require('electron').ipcRenderer.on('down-process', (event, message) => {
        if(message.url == option.file_url){
          _that.$set(option, 'ETag' , message.ETag)
          _that.$set(option, 'state' , message.state)
          _that.$set(option, 'process' , (message.receive/message.total)*100)
        }
      })
      require('electron').ipcRenderer.on('down-completed', (event, message) => {
        if(message.url == option.file_url){
          console.log('下载结束', message.state);
          _that.$set(option, 'state' , message.state)
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
      let isHasBool = false
      _that.downloadArr.find((res)=>{
        if(res.file_url === item.file_url){
          isHasBool = true
        }
      })
      if(!isHasBool) {
        _that.downloadArr.push(item)
        const { remote } = require('electron')
        let webContents = remote.getCurrentWebContents
        // 开始下载
        if(item.file_url !== undefined) {
          webContents().downloadURL(item.file_url)
          require('electron').ipcRenderer.on('down-process', (event, message) => {
            if(message.url == item.file_url){
              _that.$set(item, 'ETag' , message.ETag)
              _that.$set(item, 'state' , message.state)
              _that.$set(item, 'process' , (message.receive/message.total)*100)
            }
          })
          require('electron').ipcRenderer.on('down-completed', (event, message) => {
            console.log('下载结束', message.state,message.url == item.file_url,);
            if(message.url == item.file_url){
              console.log('下载结束', message.state);
              _that.$set(item, 'state' , message.state)
            }
          })
        }
      }else {
        console.log('该下载任务已存在');
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
