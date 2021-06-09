<template>
  <q-pull-to-refresh @refresh="refresh">
    <div>
      <img-box :img-obj="imgObj" class=""/>
      <DownloadSet></DownloadSet>
    </div>
  </q-pull-to-refresh>
</template>

<script>
import ImgBox from 'components/ImgBox';
import { getPageList, getSum, getSumBYRequestXml } from 'src/utils/getPreviewHtml';
import eventBus from 'src/utils/eventbus';
import DownloadSet from 'components/DownloadSet'

export default {
  name: 'PageIndex',
  data() {
    return {
      imgObj: [],
      pageSize: 20,
      pageNumber: 10,
      key: ''
    };
  },
  components: {
    ImgBox, DownloadSet
  },
  watch: {
    pageSize(newVal) {

    }
  },
  mounted() {
    // setTimeout(()=>{
    //   db()
    // } ,20000)

  },
  created() {
    /***
     * 设置每页图片数
     */
    eventBus.$off("setPageSize");
    eventBus.$on('setPageSize', function(data){
      this.pageSize = data
      this.getPageListFunction()
    }.bind(this))
    /***
     * 设置页码
     */
    eventBus.$off("pageNumber");
    eventBus.$on('pageNumber', function(data){
      this.pageNumber = data
      this.getPageListFunction()
    }.bind(this))
    /***
     * 设置pageSize
     */
    eventBus.$off("pageSize");
    eventBus.$on('pageSize', function(data){
      this.pageSize = data
    }.bind(this))
    /***
     * searchFunction
     */
    eventBus.$off("searchFunction");
    eventBus.$on('searchFunction', function(){
      this.getPageListFunction()
    }.bind(this))
    /***
     * 获取图片信息
     */
    this.getPageListFunction()
    console.log("数据库操作后");
    /***
     * 关键词监听
     */
    eventBus.$off("key");
    eventBus.$on('key', function(data){
      this.key = data
    }.bind(this))
  },
  methods: {
    refresh(done){
      setTimeout(()=>{
        done()
      },2000)
    },
    /***
     * 图片获取方式：解析html中的js-》post代码
     */
    getPageListFunction() {
      let arr = []
      getPageList(this.pageSize, this.pageNumber, 3, this.key).then(res => {
        res.forEach(item => {
          arr.push(...item)
        })
        this.imgObj = arr
      })
    },
  }
};
</script>
