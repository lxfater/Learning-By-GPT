<script setup lang="ts">
import { showNotify } from 'vant';
import { provide, ref } from 'vue';
import Browser from 'webextension-polyfill';
const port = Browser.runtime.connect({name: 'Learn-By-GPT'})
provide('port', port )
let lastType = ''
port.onMessage.addListener((msg) => {
  if(lastType !== msg.type) {
    showNotify({ message: '没有API权限,查看帮助', duration: 3000 });
    lastType = msg.type
  }
})
const active = ref(0);
const onChange = (index: number) => {
  console.log(`index: ${index}`)
  active.value = index;
};
</script>

<template>
<div class="container">
  <div class="sidebar">
    <van-sidebar v-model="active" @change="onChange">
      <van-sidebar-item title="语料生成" to="/"/>
      <van-sidebar-item title="下载任务" to="/tasks"/>
      <van-sidebar-item title="帮助" to="/help"/>
      <van-sidebar-item title="关于" to="/about"/>
    </van-sidebar>
  </div>
  <div class="main"><router-view ></router-view></div>
</div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  height: 480px;
  width: 500px;
  .sidebar {
    flex: 0 0 60px;
    background-color: #fff;
  }
  .main {
    flex: 1 1 auto;
  }
}

</style>
