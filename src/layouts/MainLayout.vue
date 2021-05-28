<template>
  <q-layout view="lHh Lpr lFf">
    <q-footer elevated>
      <q-toolbar class="bg-grey-3 text-black">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="downloadDrawerOpen"
        />
<!--        <q-radio size="xs" v-model="selectAll" :val="true"/>-->
        <q-btn
          flat
          dense
          round
          icon="filter_alt"
        >
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <q-input v-model="key" label="关键词(空格分隔)">
<!--                  <template v-slot:prepend>-->
<!--                    <q-icon name="event" />-->
<!--                  </template>-->
                </q-input>
                <q-input v-model="pageSize" label="每页图片数">
<!--                  <template v-slot:prepend>-->
<!--                    <q-icon name="event" />-->
<!--                  </template>-->
                </q-input>
              </div>
              <q-separator vertical inset class="q-mx-lg" />
              <div class="column items-center flex-center">
                <q-btn
                  color="primary"
                  icon="image_search"
                  round
                  size="lg"
                  @click="searchFunction"
                />
              </div>
            </div>
          </q-menu>
        </q-btn>
        <q-toggle
          v-model="selectAll"
          checked-icon="check"
          label="全选"
          unchecked-icon="clear"
        />
        <q-btn
          flat
          dense
          round
          @click="downloadSelect"
          icon="play_for_work"
        >
        </q-btn>
        <q-space></q-space>
<!--        <q-input filled v-model="pageSize" label="每页图片数" style="width: 10px">-->
<!--          <template v-slot:prepend>-->
<!--            <q-icon name="event" />-->
<!--          </template>-->
<!--          <template v-slot:after>-->
<!--            <q-btn round dense flat icon="send" @click="setPageSize"/>-->
<!--          </template>-->
<!--        </q-input>-->
        <q-space />
        <q-pagination
          v-model="pageNumber"
          input
          :max="max"
          input-class="text-black"
          class="flex flex-center"
        />
      </q-toolbar>
    </q-footer>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue';
import eventBus from 'src/utils/eventbus';
import { getSum } from 'src/utils/getPreviewHtml';

const linksData = [
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

export default {
  name: 'MainLayout',
  components: { EssentialLink },
  data() {
    return {
      key: '', //搜索关键词
      max: 1,
      leftDrawerOpen: false,
      essentialLinks: linksData,
      pageNumber: 1,
      selectAll: false,
      pageSize: 21
    };
  },
  watch: {
    /***
     * 监听图片全选方法
     * @param newVal
     */
    selectAll(newVal) {
      eventBus.$emit('selectAll', newVal)
    },
    pageNumber(newVal) {
      eventBus.$emit('pageNumber', newVal)
    },
    key(newVal) {
      eventBus.$emit('key', newVal)
    },
    pageSize(newVal) {
      this.getSumNumber()
      eventBus.$emit('pageSize', newVal)
    },
  },
  created() {
    this.getSumNumber()
  },
  mounted() {

  },
  methods: {
    /***
     * 搜索图片
     */
    searchFunction() {
      eventBus.$emit('searchFunction')
    },
    /***
     * 获取站点总图片数
     */
    getSumNumber() {
      let _that = this
      getSum().then(res => {
        let max = Number(res)/_that.pageSize
        _that.max = Number(res)%_that.pageSize === 0 ? parseInt(max) : parseInt(max) + 1
      })
    },
    /***
     * 打开下载列表
     */
    downloadDrawerOpen() {
      eventBus.$emit('downloadDrawerOpen')
    },
    /***
     * 设置每页图片数
     */
    setPageSize() {
      eventBus.$emit('setPageSize', this.pageSize)
    },
    /***
     * 下载所选图片按钮点击方法
     */
    downloadSelect(){
      eventBus.$emit('downloadSelect')
    }
  }
};
</script>
