<script setup lang="ts">
import { ref } from 'vue';
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
      <van-sidebar-item title="英语学习" to="/"/>
      <van-sidebar-item title="任务" to="/tasks"/>
      <van-sidebar-item title="关于" to="/about"/>
    </van-sidebar>
  </div>
  <div class="main"><router-view ></router-view></div>
</div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  height: 420px;
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
