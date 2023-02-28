import type { Job, JobArr, JobDetail } from './types'
import Browser from 'webextension-polyfill'
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { JobMeta } from './types'
import { ChatGptWebProvider } from '@lxfater/ai-bridge';

let instance = new ChatGptWebProvider();

class JobQueue {
    jobMap = new Map<string, JobMeta>()
    controllers = new Map<string, AbortController>()
    queue = new PQueue({concurrency: 1});
    port: Browser.Runtime.Port | undefined
    listen() {
        Browser.runtime.onConnect.addListener((port) => {
            console.debug('connected', port)
            if(port.name === 'Learn-By-GPT') {
                this.loadJobs();
                this.port = port;
                port.onMessage.addListener(async (job: Job) => {
                    if(['cancelJob','deleteJob','resumeJob'].includes(job.type)) {
                        //@ts-ignore
                        this[job.type](job.key)
                    } else if (job.type === 'addJob') {
                        this[job.type](job)
                    } else if(job.type === 'resetJobs') {
                        this.resetJobs()
                    }
                })
            }
        })
    }
    async loadJobs() {
        const rawData = await Browser.storage.local.get('jobMap');
        this.jobMap = this.deSterilizeJobMap(rawData.jobMap);
    }
    async createJob(job: Job) {
        const key = job.key
        const controller = this.controllers.get(key) as AbortController
        if(controller.signal.aborted) {
            this.changeJobState(key, 'canceled')
            return 0;
        }
       
        this.changeJobState(key, 'running')
        this.changeJobStage(key, 'story')
        let story = await this.createCancelRetryJob(() => instance.ask(job.detail.story, {
            signal: controller.signal,
            deleteConversation: true
        }), key)
        if(controller.signal.aborted) {
            this.changeJobState(key, 'canceled')
            return 0;
        }
        this.changeJobResult(key, 'story', story as string)
        let keysWithoutStory = (Object.keys(job.detail) as (keyof JobDetail)[]).filter(x => x !== 'story')
        for await (const k of keysWithoutStory) {
            if(job.detail[k] && job.detail[k].length > 0) {
                let actualDetail = job.detail[k].replaceAll('${story}', story as unknown as string)
                this.changeJobStage(key, k)
                const content = await this.createCancelRetryJob(() => instance.ask(actualDetail, {
                    signal: controller.signal,
                    deleteConversation: true
                }), key)
                if(controller.signal.aborted) {
                    this.changeJobState(key, 'canceled')
                    break;
                }
                this.changeJobResult(key, k, content as string)
            }
        }
        this.changeJobState(key, 'done')

    }
    async createCancelRetryJob(job: (...arg:unknown[]) => unknown , key: string) {
        const signal = (this.controllers.get(key) as AbortController).signal
        return await pRetry(job, {
            onFailedAttempt: error => {
                console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.${error.message}}`);
                if(error.message === 'UNAUTHORIZED') { 
                    this.port?.postMessage({
                        type: 'unauthorized'
                    })
                }
                if(error.retriesLeft === 0) {
                    this.changeJobState(key, 'error')
                } else {
                    this.changeJobState(key, 'retrying')
                }
            },
            retries: 5,
            signal: signal,
            maxRetryTime: 1000 * 60 * 5
        }).catch((e) => {
            console.log(e)
        })
    }
    addJob(job: Job) {
        this.jobMap.set(job.key, {
            job,
            state: 'pending',
            stage: 'story',
            result: {
                story: '',
                cloze: '',
                translation: '',
                words: '',
                questions: ''
            }
        }) 
        this.controllers.set(job.key, new AbortController())
        this.changeJobState(job.key,'pending')       
        this.queue.add(() => this.createJob(job))   
    }
    async createResumeJob(key: string) {
        if(this.jobMap.has(key)) {
            let result = this.jobMap.get(key)!.result
            let job = this.jobMap.get(key)!.job
            const controller = new AbortController();
            this.controllers.set(key, controller)
            if(controller.signal.aborted) {
                this.changeJobState(key, 'canceled')
                return 0;
            }

            this.changeJobState(key, 'running')

            let story = result.story

            const hasStory = result.story
            if(!hasStory) {
                this.changeJobStage(key, 'story')
                story = await this.createCancelRetryJob(() => instance.ask(this.jobMap.get(key)!.job.detail.story, {
                    signal: controller.signal,
                    deleteConversation: true
                }), key) as string;
                if(controller.signal.aborted) {
                    this.changeJobState(key, 'canceled')
                    return 0;
                }
                this.changeJobResult(key, 'story', story as string)
            }

            let keysWithoutStory = (Object.keys(job.detail) as (keyof JobDetail)[]).filter(x => x !== 'story')
            for await (const k of keysWithoutStory) {
                const hasContent = result[k]
                const hasPrompt = job.detail[k] && job.detail[k].length > 0
                if( hasPrompt  && !hasContent) {
                    let actualDetail = job.detail[k].replaceAll('${story}', story as unknown as string)
                    this.changeJobStage(key, k)
                    const content = await this.createCancelRetryJob(() => instance.ask(actualDetail, {
                        signal: controller.signal,
                        deleteConversation: true
                    }), key)
                    if(controller.signal.aborted) {
                        this.changeJobState(key, 'canceled')
                        break;
                    }
                    this.changeJobResult(key, k, content as string)
                }
            }
            this.changeJobState(key, 'done')

        } else {
            console.error('job not found')
        }
    }
    async resumeJob(key: string) {
        this.changeJobState(key, 'pending')
        this.queue.add(() => this.createResumeJob(key))
    }
    async cancelJob(key: string) {
        if(this.jobMap.has(key)) {
            const controller = this.controllers.get(key) as AbortController
            if(controller) {
                if(!controller.signal.aborted) {
                    try {
                        controller.abort()
                    } catch (error) {
                        console.error(error)
                    } finally {
                        this.changeJobState(key, 'canceled')
                        await this.saveData()
                    }
                }
            } else {
                this.changeJobState(key, 'canceled')
            }
        } else {
            console.error('job not found')
        }
    }
    async deleteJob(key: string) {
        await this.cancelJob(key)
        this.jobMap.delete(key)
        await this.saveData()
    }
    async resetJobs() {
        for await (const [key, value] of this.jobMap.entries()) {
            if(value.state !== 'done') {
                this.cancelJob(key)
            }
        }
        this.queue.clear()
        await this.saveData()
    }
    async changeJobState(key: string, state: JobMeta['state']) {
        this.jobMap.get(key)!.state = state
        await this.saveData()
    }
    async changeJobStage(key: string, stage:JobMeta['stage']) {
        this.jobMap.get(key)!.stage = stage
        await this.saveData()
    }
    async changeJobResult(key: string, resultKey: string, content: string) {
        // @ts-ignore
        this.jobMap.get(key)!.result[resultKey] = content
        await this.saveData()
    }
    async saveData() {
        await Browser.storage.local.set({jobMap: this.sterilizeJobMap()})
    }
    sterilizeJobMap() {
        return [...this.jobMap.entries()]
    }
    deSterilizeJobMap(data: [string, JobMeta][]) {
        return new Map(data)
    }
}

const jobQueue = new JobQueue()
jobQueue.listen()