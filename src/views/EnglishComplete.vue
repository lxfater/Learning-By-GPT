<script setup lang="ts">
import type { Job, JobDetail } from '../types';
import { inject, reactive, ref } from 'vue';
import { getAnswer, getAccessToken } from '../utils/chatGpt';
import { showNotify, showToast } from 'vant';
import Browser from 'webextension-polyfill';


const keywords = ref('')
const digit = ref(100)
const loading = ref(false)
const loadingText = ref('正在生成关键词')
const title = ref('')

// type
const typeShowPicker = ref(false)
const types = [
    { text: "小说", value: "Novel" },
    { text: "短篇小说", value: "Short story" },
    { text: "诗歌", value: "Poetry" },
    { text: "戏剧", value: "Drama" },
    { text: "散文", value: "Essay" },
    { text: "传记", value: "Biography" },
    { text: "自传", value: "Autobiography" },
    { text: "回忆录", value: "Memoir" },
    { text: "讽刺作品", value: "Satire" },
    { text: "寓言", value: "Fable" },
    { text: "寓言故事", value: "Allegory" },
    { text: "神话", value: "Myth" },
    { text: "传说", value: "Legend" },
    { text: "童话故事", value: "Fairy tale" },
    { text: "科幻小说", value: "Science fiction" },
    { text: "奇幻小说", value: "Fantasy" },
    { text: "浪漫小说", value: "Romance" },
    { text: "恐怖小说", value: "Horror" },
    { text: "惊悚小说", value: "Thriller" },
    { text: "推理小说", value: "Mystery" }
]
const typeMap = types.reduce((acc, cur) => {
    // @ts-ignore
    acc[cur.value] = cur.text
    // @ts-ignore
    acc[cur.text] = cur.value
    return acc
}, {})
const type = ref('散文')
const typeConfirm = ({ selectedValues }) => {
    type.value = typeMap[selectedValues[0]]
    typeShowPicker.value = false
};

// domain
const domainShowPicker = ref(false)
const domains = [
    { text: "科学", value: "Science" },
    { text: "技术", value: "Technology" },
    { text: "工程", value: "Engineering" },
    { text: "数学", value: "Mathematics" },
    { text: "医学", value: "Medicine" },
    { text: "法律", value: "Law" },
    { text: "商业", value: "Business" },
    { text: "新闻", value: "Journalism" },
    { text: "创意写作", value: "Creative writing" },
    { text: "学术写作", value: "Academic writing" },
    { text: "社会科学", value: "Social sciences" },
    { text: "艺术与人文学科", value: "Arts and humanities" },
    { text: "教育", value: "Education" },
    { text: "体育", value: "Sports" },
    { text: "旅游", value: "Travel" },
    { text: "美食与饮品", value: "Food and drink" },
    { text: "时尚与美容", value: "Fashion and beauty" },
    { text: "娱乐", value: "Entertainment" },
    { text: "政治", value: "Politics" },
    { text: "宗教与灵性", value: "Religion and spirituality" }
]
const domainMap = domains.reduce((acc, cur) => {
    // @ts-ignore
    acc[cur.value] = cur.text
    // @ts-ignore
    acc[cur.text] = cur.value
    return acc
}, {})
const domainConfirm = ({ selectedValues }) => {
    domain.value = domainMap[selectedValues[0]]
    domainShowPicker.value = false
};
const domain = ref('旅游')


const options = reactive({
    story: true,
    questions: false,
    cloze: false,
    translation: false,
    words: false,
})

const generateKeyWords = async () => {
    try {
        loading.value = true
        await getAccessToken()
    } catch (error) {
        loading.value = false
        showNotify({ message: '没有API权限,查看帮助', duration: 3000 });
    }

    const keywordsPrompt = `Generate 10 English keywords  about ${domain.value} randomly separated by commas.`
    let newKeywords = await getAnswer(keywordsPrompt) as string
    showNotify({ type: 'success', message: '关键词生成成功' });
    keywords.value += newKeywords
    loading.value = false
}


const port = inject('port') as Browser.Runtime.Port;
const addJobs = () => {
    const prompts = {
        story: `Write a ${typeMap[type.value]} about ${domainMap[domain.value]} of ${digit.value} words using the following words: ${keywords.value}.`,
        cloze: `Create a cloze using the missing word : ${keywords.value} with following text: \n \${story}`,
        translation: `Translate following text into Chinese: \n \${story}`,
        questions: `Create 5 question with answer using the following text: \${story}. For example: question1:answer1;question2:answer2.`,
        words: `Explain the following English words in chinese: ${keywords.value}.For example: English word1: explain1;English word2: explain2.`
    }
    const key = new Date().getTime().toString();
    let job = {
        type: 'addJob',
        key,
        title: `${ title.value.length > 0 ? title.value : `${typeMap[type.value]}-${domainMap[domain.value]}-${key}`}`,
        detail: (Object.keys(options) as Array<keyof typeof options>).reduce((acc, key: keyof JobDetail) => {
            acc[key] = options[key] ? prompts[key] : ''
            return acc
        }, {} as JobDetail)
    }
    port.postMessage(job);
    showNotify({ type: 'success', message: '添加生成任务成功,请到生成任务查看', duration: 1000 });
}
</script>

<template>
    <div class="english-complete-container">
        <div class="input">
            <van-form @submit="addJobs" validate-trigger="onSubmit">
                <van-cell-group inset>
                    <van-field v-model="keywords" rows="3" autosize type="textarea" maxlength="400" name="keywords" label="关键词"
                        placeholder="请输入单词用英文逗号隔开,例如: Cows, horses, carts." show-word-limit :rules="[{ required: true, message: '请填写关键词或者使用随机生功能' }]" />
                    <van-row>
                        <van-col span="12"><van-field v-model="digit" type="digit" label="文字字数"
                                class="count" /></van-col>
                        <van-col span="12" style="display:flex;justify-content: center;align-items: center;">
                            <van-button plain hairline size="small" type="default" :loading="loading" :loading-text="loadingText" @click="generateKeyWords">{{ `10
                            keywords
                            in
                            ${domain}` }}</van-button>
                        </van-col>
                    </van-row>
                    <van-row>
                        <van-field v-model="domain" is-link readonly label="领域" placeholder="选择领域"
                            @click="domainShowPicker = true" />
                        <van-popup v-model:show="domainShowPicker" round position="bottom">
                            <van-picker :columns="domains" @cancel="domainShowPicker = false"
                                @confirm="domainConfirm" />
                        </van-popup>
                    </van-row>
                    <van-row>
                        <van-field v-model="type" is-link readonly label="文章类型" placeholder="选择文章类型"
                            @click="typeShowPicker = true" />
                        <van-popup v-model:show="typeShowPicker" round position="bottom">
                            <van-picker :columns="types" @cancel="typeShowPicker = false" @confirm="typeConfirm" />
                        </van-popup>
                    </van-row>
                    <van-divider />
                    <van-row>
                        <van-col span="12">
                            <van-cell center title="是否翻译">
                                <template #right-icon>
                                    <van-switch size="16px" v-model="options.translation" />
                                </template>
                            </van-cell>
                        </van-col>
                        <van-col span="12">
                            <van-cell center title="是否挖空">
                                <template #right-icon>
                                    <van-switch size="16px" v-model="options.cloze" />
                                </template>
                            </van-cell>
                        </van-col>
                    </van-row>
                    <van-row>
                        <van-col span="12">
                            <van-cell center title="是否解释单词">
                                <template #right-icon>
                                    <van-switch size="16px" v-model="options.words" />
                                </template>
                            </van-cell>
                        </van-col>
                        <van-col span="12">
                            <van-cell center title="是否生成问答">
                                <template #right-icon>
                                    <van-switch size="16px" v-model="options.questions" />
                                </template>
                            </van-cell>
                        </van-col>
                    </van-row>
                    <van-row>
                        <van-field v-model="title" label="文件名称" placeholder="请输入文件名,默认为领域-文体-key" />
                    </van-row>
                </van-cell-group>
                <van-row justify="center">
                        <van-button type="primary" size="small" native-type="submit" >添加下载任务</van-button>
                </van-row>
            </van-form>

        </div>
    </div>
</template>

<style scoped lang="scss">
.english-complete-container {
    .words {
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
        height: 70px;
    }

    .input {
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
    }

    .result {
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
        max-height: 200px;
        overflow: auto;
    }
}
</style>