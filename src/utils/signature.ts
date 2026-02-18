// import crypto from 'crypto';
// import sha256 from 'crypto-js/sha256';
import crypto from 'crypto-js';
import qs from 'qs';


// import qs from 'qs';

/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE = new Set([
    // "content-length",
    // "user-agent",
    // "presigned-expires",
    // "expect",
]);

// 定义签名参数类型
interface SignParams {
    headers?: Record<string, string>;
    query?: Record<string, any>;
    region?: string;
    serviceName?: string;
    method?: string;
    pathName?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    needSignHeaderKeys?: string[];
    bodySha?: string;
}

// 定义 getSignHeaders 返回类型
type GetSignHeadersReturn = [string, string];

export function sign(params: SignParams): string {
    const {
        headers = {},
        query = {},
        region = '',
        serviceName = '',
        method = '',
        pathName = '/',
        accessKeyId = '',
        secretAccessKey = '',
        needSignHeaderKeys = [],
        bodySha,
    } = params;
    const datetime = headers["X-Date"];
    const date = datetime?.substring(0, 8) || ''; // YYYYMMDD
    // 创建正规化请求
    const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys);
    const canonicalRequest = [
        method.toUpperCase(),
        pathName,
        queryParamsToString(query) || '',
        `${canonicalHeaders}\n`,
        signedHeaders,
        bodySha || hash(''),
    ].join('\n');
    const credentialScope = [date, region, serviceName, "request"].join('/');
    // 创建签名字符串
    const stringToSign = ["HMAC-SHA256", datetime, credentialScope, hash(canonicalRequest)].join('\n');
    // 计算签名
    const kDate = crypto.HmacSHA256(date, secretAccessKey);
    const kRegion = crypto.HmacSHA256(region, kDate);
    const kService = crypto.HmacSHA256(serviceName, kRegion);
    const kSigning = crypto.HmacSHA256("request", kService);
    const signature = crypto.HmacSHA256(stringToSign, kSigning).toString(crypto.enc.Hex);
    // debuglog('--------CanonicalString:\n%s\n--------SignString:\n%s', canonicalRequest, stringToSign);
    // console.log('--------CanonicalString:\n%s\n--------SignString:\n%s', canonicalRequest, stringToSign)

    return [
        "HMAC-SHA256",
        `Credential=${accessKeyId}/${credentialScope},`,
        `SignedHeaders=${signedHeaders},`,
        `Signature=${signature}`,
    ].join(' ');
}

function hmac(secret: string, s: string): string {
    // return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
    return crypto.HmacSHA256(s, secret).toString(crypto.enc.Hex);
}

export function hash(s: string): string {
    // return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
    return crypto.SHA256(s).toString(crypto.enc.Hex);
}

function queryParamsToString(params: Record<string, any>): string {
    return Object.keys(params)
        .sort()
        .map((key) => {
            const val = params[key];
            if (typeof val === 'undefined' || val === null) {
                return undefined;
            }
            const escapedKey = uriEscape(key);
            if (!escapedKey) {
                return undefined;
            }
            if (Array.isArray(val)) {
                return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
            }
            return `${escapedKey}=${uriEscape(val)}`;
        })
        .filter((v): v is string => v !== undefined)
        .join('&');
}

function getSignHeaders(originHeaders: Record<string, string>, needSignHeaders: string[]): GetSignHeadersReturn {
    function trimHeaderValue(header: string): string {
        return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
    }

    let h = Object.keys(originHeaders);
    // 根据 needSignHeaders 过滤
    if (Array.isArray(needSignHeaders)) {
        const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
        h = h.filter((k) => needSignSet.has(k.toLowerCase()));
    }
    // 根据 ignore headers 过滤
    h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase() as never));
    const signedHeaderKeys = h
        .slice()
        .map((k) => k.toLowerCase())
        .sort()
        .join(';');
    const canonicalHeaders = h
        .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
        .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
        .join('\n');
    return [signedHeaderKeys, canonicalHeaders];
}

function uriEscape(str: string): string {
    try {
        return encodeURIComponent(str)
            .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
            .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
    } catch (e) {
        return '';
    }
}

export function getDateTimeNow(): string {
    const now = new Date();
    // 确保使用 UTC 时间
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    // 生成正确的 X-Date 格式: YYYYMMDD'T'HHMMSS'Z'
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// 获取 body sha256
// function getBodySha(body) {
//     const hash = crypto.createHash('sha256');
//     if (typeof body === 'string') {
//         hash.update(body);
//     } else if (body instanceof url.URLSearchParams) {
//         hash.update(body.toString());
//     } else if (util.isBuffer(body)) {
//         hash.update(body);
//     }
//     return hash.digest('hex');
// }