<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createStory } from '../utils/doc';
import { getAnswer, getAccessToken } from '../utils/chatGpt';
import { showNotify, showToast } from 'vant';
const message = ref('')
const digit = ref(100)
const loading = ref(false)
const loadingText = ref('')

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

// ArrayToMap
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
    domain.value = domains[selectedValues[0]]
    domainShowPicker.value = false
};
const domain = ref('旅游')
const options = reactive({
    story: true,
    question: false,
    cloze: false,
    translation: false,
    word: false,
})

const generateKeyWords = async () => {
    loading.value = true
    try {
        await getAccessToken()
    } catch (error) {
        showNotify({ type: 'danger', message: '无权限，请登录ChatGPT, 5s内跳转' })
        loading.value = false
        setTimeout(() => {
            window.open('https://chat.openai.com/chat')
        }, 5 * 1000)
    }
    loadingText.value = '正在生成关键词'
    const keywordsPromote = `Generate 10 keywords  about ${domain.value} randomly separated by commas.`
    let keywords = await getAnswer(keywordsPromote) as string
    showNotify({ type: 'success', message: '关键词生成成功' });
    message.value += keywords
    loading.value = false
}
const generate = async () => {
    loading.value = true
    try {
        await getAccessToken()
    } catch (error) {
        showNotify({ type: 'danger', message: '无权限，请登录ChatGPT, 5s内跳转' })
        loading.value = false
        setTimeout(() => {
            window.open('https://chat.openai.com/chat')
        }, 5 * 1000)
    }
    loadingText.value = '正在生成故事'
    const storyPromote = `Write a ${typeMap[type.value]} about ${domainMap[domain.value]} of ${digit.value} words using the following words: ${message.value}. `
    let story = await getAnswer(storyPromote) as string
    showNotify({ type: 'success', message: '故事生成成功' });
    let close = ''
    if (options.cloze) {
        const clozePromote = `Create a cloze using the missing word : ${message.value} with following text: ${story}`
        loadingText.value = '正在挖空'
        close = await getAnswer(clozePromote) as string
        showNotify({ type: 'success', message: '挖空成功' });
    }
    let translation = ''
    if (options.translation) {
        const translationPromote = `Translate following text into Chinese: ${story}`
        loadingText.value = '正在翻译'
        translation = await getAnswer(translationPromote) as string
        showNotify({ type: 'success', message: '翻译成功' });
    }

    let question = ''
    if(options.question) {
        const questionPromote = `Create 5 question with answer using the following text: ${story}, item should be separated by semicolon`
        loadingText.value = '正在生成问题'
        question = await getAnswer(questionPromote) as string
        showNotify({ type: 'success', message: '问题生成成功' });
    }
    let words = ''
    if (options.word) {
        const wordPromote = `Explain the following words in chinese: ${message.value}, item should be separated by semicolon`
        loadingText.value = '正在解释单词'
        words = await getAnswer(wordPromote) as string
        showNotify({ type: 'success', message: '单词解释成功' });
    }
    createStory(story, close, translation, words.split(';'), question.split(';'))
    loading.value = false
}
</script>

<template>
    <div class="english-complete-container">
        <div class="input">
            <van-cell-group inset>
                <van-field v-model="message" rows="3" autosize type="textarea" maxlength="400"
                    placeholder="请输入单词用英文逗号隔开,例如: Cows, horses, carts." show-word-limit />
                <van-row>
                    <van-col span="12"><van-field v-model="digit" type="digit" label="文字字数" class="count" /></van-col>
                    <van-col span="12" style="display:flex;justify-content: center;
    align-items: center;">
                        <van-button plain hairline size="small" type="default" @click="generateKeyWords">{{ `10 keywords in
                        ${domain}` }}</van-button>
                    </van-col>
                </van-row>
                <van-row>
                    <van-field v-model="domain" is-link readonly label="领域" placeholder="选择领域"
                        @click="domainShowPicker = true" />
                    <van-popup v-model:show="domainShowPicker" round position="bottom">
                        <van-picker :columns="domains" @cancel="domainShowPicker = false" @confirm="domainConfirm" />
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
                                <van-switch size="16px" v-model="options.word" />
                            </template>
                        </van-cell>
                    </van-col>
                    <van-col span="12">
                        <van-cell center title="是否生成问答">
                            <template #right-icon>
                                <van-switch size="16px" v-model="options.question" />
                            </template>
                        </van-cell>
                    </van-col>
                </van-row>
            </van-cell-group>
            <van-row justify="space-around">
                    <van-button type="primary"  :loading="loading" @click="generate"
                        :loading-text="loadingText" size="small" >下载WORD</van-button>
                    <van-button type="danger"  @click="cancel"
                         size="small" >取消生成</van-button>
            </van-row>

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