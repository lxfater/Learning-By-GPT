<script setup lang="ts">
</script>

<template>
    <div class="list-container">
        <div class="list">
            <div class="item">
                <a class="link" href="https://juejin.cn/user/3034307822099031" target="_blank" >掘金地址</a>
            </div>
            <div class="item">
                <a class="link" href="https://twitter.com/lxfater" target="_blank">推特地址</a>
            </div>
            <div class="item">
                <a class="link" href="https://github.com/lxfater" target="_blank">Github地址</a>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.list-container {
    
    .list {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 100vh;
        .item {
            .link {
                font-size: 40px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #000;
            }
        }
    }
}
</style>