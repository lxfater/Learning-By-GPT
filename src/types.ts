
type JobType = 'addJob' | 'cancelJob' | 'resumeJob' | 'deleteJob' | 'resetJobs'
export type JobDetail = {
    story: string,
    cloze: string,
    translation: string,
    words: string,
    questions: string
}
export type Job = {
    type: JobType,
    title: string,
    key: string,
    detail: JobDetail
}

export type JobMeta = {
    state: 'pending' | 'running' | 'done' | 'error' | 'canceled' | 'retrying',
    stage: 'story' | 'cloze' | 'translation' | 'words' | 'questions'
    result: JobDetail
    job: Job
}

export type JobArr = [string, JobMeta][]