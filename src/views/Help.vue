<script setup lang="ts">
</script>

<template>
<div class="help-container">
    <div class="list">
        <div class="item">
            <div class="question">对账号有风险？</div>
            <div class="answer">我目前还没有听过这样的事情，但是我不能保证你的账号不会被ban，建议使用小号登录</div>
        </div>
        <div class="item">
            <div class="question">如何使用本软件？</div>
            <div class="answer">
                <li>首先登录ChatGPT</li>
                <li>输入或者生成关键字，配置生成文章和题型</li>
                <li>在下载任务Tab页中下载为docx文件</li>
            </div>
        </div>
        <div class="item">
            <div class="question">为什么提示没有没有API权限？</div>
            <div class="answer">这是一款基于ChatGPT开发的扩展，这意味着你登录ChatGPT来使用这些功能。<a href="https://chat.openai.com/chat" target="_blank">点击这里</a>。登录你的账号。</div>
        </div>
        <div class="item">
            <div class="question">没有ChatGPT账号怎么办？</div>
            <div class="answer">申请一个，或者等待后续版本更新。</div>
        </div>
        <div class="item">
            <div class="question">从错误恢复功能做什么的？</div>
            <div class="answer">点击从错误恢复，就会暂停所有正在生成的数据。你可以手动点击恢复。</div>
        </div>
        <div class="item">
            <div class="question">为什么生成这么慢或者无法生成？</div>
            <div class="answer">由于使用了免费的API,导致生成比较慢，建议不要生成太多题型，减少字数，会快点。</div>
        </div>
    </div>
</div>

</template>

<style scoped lang="scss">
.help-container {
    padding: 10px;
    .list {
        .item {
            .question {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .answer {
                font-size: 14px;
                margin-bottom: 20px;
            }
        }
    }
}
</style>