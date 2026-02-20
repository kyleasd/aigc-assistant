import req from '@/utils/req'

export const videoAPI = {
    // 提交 即梦AI-视频生成3.0Pro 1080P
    submitJimeng3_0Pro1080P: async (prompt: string) => {
        return req.post('/api/v1/jimeng/submit', { prompt, reqKey: "jimeng_ti2v_v30_pro" }).then(res => res.data);
    },
    getJimeng3_0Pro1080PResult: async (taskId: string) => {
        return req.post('/api/v1/jimeng/result', { taskId, reqKey: "jimeng_ti2v_v30_pro" }).then(res => res.data);
    },
    // 提交 即梦AI-视频生成3.0 1080P
    submitJimeng3_0_1080P: async (prompt: string) => {
        return req.post('/api/v1/jimeng/submit', { prompt, reqKey: "jimeng_t2v_v30_1080p" }).then(res => res.data);
    },
    getJimeng3_0_1080PResult: async (taskId: string) => {
        return req.post('/api/v1/jimeng/result', { taskId, reqKey: "jimeng_t2v_v30_1080p" }).then(res => res.data);
    },
    // 提交 即梦AI-视频生成3.0 720P
    submitJimeng3_0_720P: async (prompt: string) => {
        return req.post('/api/v1/jimeng/submit', { prompt, reqKey: "jimeng_t2v_v30" }).then(res => res.data);
    },
    // 获取 即梦AI-视频生成3.0 720P 结果
    getJimeng3_0_720PResult: async (taskId: string) => {
        return req.post('/api/v1/jimeng/result', { taskId, reqKey: "jimeng_t2v_v30" }).then(res => res.data);
    },
}