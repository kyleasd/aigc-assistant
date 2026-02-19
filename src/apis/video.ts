import req from '@/utils/req'
import { hash, getDateTimeNow, sign } from '@/utils/signature'
import qs from 'qs';

const serviceName = import.meta.env.VITE_CHAT_API_SERVICE_NAME;
const region = import.meta.env.VITE_CHAT_API_REGION;
const host = import.meta.env.VITE_CHAT_API_Host;
const version = import.meta.env.VITE_CHAT_API_VERSION;
const accessKey = import.meta.env.VITE_CHAT_API_ACCESS_KEY_ID;
const secretKey = import.meta.env.VITE_CHAT_API_SECRET_ACCESS_KEY;

export const videoAPI = {
    // 提交 即梦AI-视频生成3.0Pro 1080P
    submitJimeng3_0Pro1080P: async (prompt: string) => {
        const requestBody = {
            req_key: "jimeng_ti2v_v30_pro",
            prompt
        };
        const bodyString = JSON.stringify(requestBody);
        const bodySha = hash(bodyString);

        const signParams = {
            headers: {
                "X-Date": getDateTimeNow(),
                "Host": host,
                "Content-Type": "application/json"
            },
            method: 'POST',
            query: {
                Version: version,
                Action: "CVSync2AsyncSubmitTask",
            },
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            serviceName: serviceName,
            region: region,
            bodySha: bodySha,
            pathName: '/'
        };
        const authorization = sign(signParams);

        // Remove Host header as it's forbidden to set manually in browsers
        const { Host, ...safeHeaders } = signParams.headers;

        return fetch(`/jimeng?${qs.stringify(signParams.query)}`, {
            headers: {
                ...safeHeaders,
                "Authorization": authorization
            },
            method: signParams.method,
            body: bodyString
        }).then(res => res.json());
    },
    getJimeng3_0Pro1080PResult: async (taskId: string) => {
        const requestBody = {
            req_key: "jimeng_ti2v_v30_pro",
            task_id: taskId,
        };
        const bodyString = JSON.stringify(requestBody);
        const bodySha = hash(bodyString);

        const signParams = {
            headers: {
                "X-Date": getDateTimeNow(),
                "Host": host,
                "Content-Type": "application/json"
            },
            method: 'POST',
            query: {
                Version: version,
                Action: "CVSync2AsyncGetResult",
            },
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            serviceName: serviceName,
            region: region,
            bodySha: bodySha,
            pathName: '/'
        };

        const authorization = sign(signParams);

        const { Host, ...safeHeaders } = signParams.headers;

        return fetch(`/jimeng?${qs.stringify(signParams.query)}`, {
            headers: {
                ...safeHeaders,
                "Authorization": authorization
            },
            method: signParams.method,
            body: bodyString
        }).then(res => res.json());

    },
    // 提交 即梦AI-视频生成3.0 1080P
    submitJimeng3_0_1080P: async (prompt: string) => {
        const requestBody = {
            req_key: "jimeng_t2v_v30_1080p",
            prompt
        };
        const bodyString = JSON.stringify(requestBody);
        const bodySha = hash(bodyString);

        const signParams = {
            headers: {
                "X-Date": getDateTimeNow(),
                "Host": host,
                "Content-Type": "application/json"
            },
            method: 'POST',
            query: {
                Version: version,
                Action: "CVSync2AsyncSubmitTask",
            },
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            serviceName: serviceName,
            region: region,
            bodySha: bodySha,
            pathName: '/'
        };
        const authorization = sign(signParams);

        // Remove Host header as it's forbidden to set manually in browsers
        const { Host, ...safeHeaders } = signParams.headers;

        return fetch(`/jimeng?${qs.stringify(signParams.query)}`, {
            headers: {
                ...safeHeaders,
                "Authorization": authorization
            },
            method: signParams.method,
            body: bodyString
        }).then(res => res.json());
    },
    getJimeng3_0_1080PResult: async (taskId: string) => {
        const requestBody = {
            req_key: "jimeng_t2v_v30_1080p",
            task_id: taskId,
        };
        const bodyString = JSON.stringify(requestBody);
        const bodySha = hash(bodyString);

        const signParams = {
            headers: {
                "X-Date": getDateTimeNow(),
                "Host": host,
                "Content-Type": "application/json"
            },
            method: 'POST',
            query: {
                Version: version,
                Action: "CVSync2AsyncGetResult",
            },
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            serviceName: serviceName,
            region: region,
            bodySha: bodySha,
            pathName: '/'
        };

        const authorization = sign(signParams);

        const { Host, ...safeHeaders } = signParams.headers;

        return fetch(`/jimeng?${qs.stringify(signParams.query)}`, {
            headers: {
                ...safeHeaders,
                "Authorization": authorization
            },
            method: signParams.method,
            body: bodyString
        }).then(res => res.json());
    },
}