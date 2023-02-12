<script setup lang="ts">
import Browser from 'webextension-polyfill';
import { computed, inject, onMounted, ref } from 'vue';
import { JobArr, JobDetail, JobMeta } from '../types';
import { createStory } from '../utils/doc';
const stateMap = {
    'running': '进行中',
    'canceled': '已暂停',
    'done': '已完成',
    'error': '出错',
    'pending': '等待处理',
    'retrying': '重试中'
}
const stageMap = {
    'story': '内容',
    'cloze': '填空',
    'translation': '翻译',
    'words': '单词',
    'questions': '问题'
}
const list = ref<JobArr>([]);
let map: { [key: string]: JobMeta } = {}
const toMap = (list: JobArr) => {
    return list.reduce((acc, cur) => {
        // @ts-ignore
        acc[cur[0]] = cur[1]
        return acc
    }, {})
}
onMounted(async () => {
    const rawData = await Browser.storage.local.get('jobMap');
    list.value = (rawData.jobMap as JobArr)
    map = toMap(rawData.jobMap)
    Browser.storage.onChanged.addListener((changes, namespace) => {
        list.value = (changes.jobMap.newValue as JobArr)
        map = toMap(changes.jobMap.newValue)
    });
})

const port = inject('port') as Browser.Runtime.Port;
const download = (key: string) => {
    const job = map[key]
    const { story, cloze, translation, words,questions }  = job.result
    console.log(words, questions, job.job.title)
    createStory(job.job.title,story, cloze, translation, words.split('\n'),questions.split('\n'))
}

const cancelJob = (key: string) => {
    port.postMessage({
        type: 'cancelJob',
        key
    })
}

const resumeJob = (key: string) => {
    port.postMessage({
        type: 'resumeJob',
        key
    })
}

const deleteJob = (key: string) => {
    port.postMessage({
        type: 'deleteJob',
        key
    })
}

const resetJobs = () => {
    port.postMessage({
        type: 'resetJobs'
    })
}

</script>

<template>
    <div class="tasks-container">
        <div v-if="list.length !== 0">
            <van-cell v-for="i in list" :key="i[0]" class="item">
            <div class="status">
                <div class="title">
                    {{ `${ i[1].job.title }` }}
                </div>
                <div class="stage">
                    {{ `${stateMap[i[1].state]} ${ i[1].state === 'running' ? `正在生成: ${stageMap[i[1].stage]}` : ''}` }}
                </div>
            </div>
            <template #extra>
                <template v-if="i[1].state === 'done'">
                    <van-button type="success" size="mini" @click="download(i[0])">下载</van-button>
                </template  >
                <template v-else-if="i[1].state === 'canceled' || i[1].state === 'error'">
                    <van-button type="primary" size="mini" @click="resumeJob(i[0])" >恢复</van-button>
                </template>
                <template v-else-if="i[1].state === 'pending' || i[1].state === 'running' || i[1].state === 'retrying'">
                    <van-button type="default" size="mini" @click="cancelJob(i[0])">暂停</van-button>
                </template>
                <van-button plain hairline type="danger" size="mini" @click="deleteJob(i[0])">删除</van-button>
            </template>
        </van-cell>
        </div>
        <div v-else class="no-task">
            当前没有任务
        </div>
    </div>
    <div class="action">
        <van-button type="primary" size="mini" @click="resetJobs" >从错误中恢复</van-button>
    </div>
</template>

<style scoped lang="scss">
.tasks-container {
    overflow-x: hidden;
    overflow-y: auto;
    height: 440px;
    .item {
        width: auto;
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
        .status {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            .title {
                color: rgb(51, 51, 51);
                font-weight: 500;
            }
            .stage {
                color: rgb(179, 179, 179);
                font-weight: 400;
                padding-right: 5px;
            }
        }
    }
    .no-task {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 440px;
        font-size: 20px;
        color: #ccc;
    }
}
.action {
    display: flex;
    padding-right: 10px;
    height: 40px;
    flex-direction: row;
    justify-content: flex-end;
}
</style>