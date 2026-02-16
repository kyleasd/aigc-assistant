/*
 * 火山引擎 API 签名工具
 * 支持浏览器和 Node.js 环境
 */

// 动态导入 crypto 模块以支持不同环境
let cryptoModule: any;
try {
  // 在 Node.js 环境中
  cryptoModule = require('crypto');
} catch (e) {
  // 在浏览器环境中使用 Web Crypto API
  cryptoModule = {
    createHmac: (algorithm: string, secret: string) => ({
      update: (data: string) => ({
        digest: async (encoding?: string) => {
          if (typeof window !== 'undefined' && window.crypto) {
            // 浏览器环境
            const encoder = new TextEncoder();
            const keyData = encoder.encode(secret);
            const dataBytes = encoder.encode(data);
            
            const key = await window.crypto.subtle.importKey(
              'raw',
              keyData,
              { name: 'HMAC', hash: 'SHA-256' },
              false,
              ['sign']
            );
            
            const signature = await window.crypto.subtle.sign('HMAC', key, dataBytes);
            const signatureArray = new Uint8Array(signature);
            
            if (encoding === 'hex') {
              return Array.from(signatureArray)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            }
            return signatureArray;
          } else {
            throw new Error('Crypto not available');
          }
        }
      })
    }),
    createHash: (algorithm: string) => ({
      update: (data: string) => ({
        digest: (encoding: string) => {
          if (typeof window !== 'undefined' && window.crypto) {
            // 浏览器环境使用 Web Crypto API
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(data);
            const hashBuffer = window.crypto.subtle.digest('SHA-256', dataBytes);
            if (encoding === 'hex') {
              return hashBuffer.then(hashArray => {
                const hashArrayBuffer = new Uint8Array(hashArray);
                return Array.from(hashArrayBuffer)
                  .map(b => b.toString(16).padStart(2, '0'))
                  .join('');
              });
            }
            return hashBuffer;
          } else {
            throw new Error('Crypto not available');
          }
        }
      })
    })
  };
}

import { VOLCENGINE_CONFIG } from '@/apis/config';

// 签名参数接口
export interface SignParams {
  method: string;
  path: string;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  body?: string;
  timestamp?: string;
}

// 签名结果接口
export interface SignatureResult {
  authorization: string;
  timestamp: string;
  signedHeaders: string;
}

/**
 * 火山引擎 API 签名器类
 */
export class VolcengineAPISigner {
  private accessKeyId: string;
  private secretAccessKey: string;
  private serviceName: string;
  private region: string;

  constructor(
    accessKeyId: string = VOLCENGINE_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: string = VOLCENGINE_CONFIG.SECRET_ACCESS_KEY,
    serviceName: string = VOLCENGINE_CONFIG.SERVICE_NAME,
    region: string = VOLCENGINE_CONFIG.REGION
  ) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Access Key ID and Secret Access Key are required');
    }
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.serviceName = serviceName;
    this.region = region;
  }

  /**
   * 生成当前时间戳
   */
  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  }

  /**
   * HMAC-SHA256 签名
   */
  private async hmac(secret: string, data: string): Promise<ArrayBuffer | Uint8Array> {
    if (typeof window !== 'undefined' && window.crypto) {
      // 浏览器环境
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const dataBytes = encoder.encode(data);
      
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await window.crypto.subtle.sign('HMAC', key, dataBytes);
      return new Uint8Array(signature);
    } else {
      // Node.js 环境
      const crypto = await import('crypto');
      return crypto.createHmac('sha256', secret).update(data, 'utf8').digest();
    }
  }

  /**
   * SHA256 哈希
   */
  private async hash(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto) {
      // 浏览器环境
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBytes);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      // Node.js 环境
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
  }

  /**
   * URI 转义
   */
  private uriEscape(str: string): string {
    try {
      return encodeURIComponent(str)
        .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
        .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
    } catch (e) {
      return '';
    }
  }

  /**
   * 格式化查询参数
   */
  private formatQueryParams(params: Record<string, string | string[]>): string {
    return Object.keys(params)
      .sort()
      .map((key) => {
        const value = params[key];
        const escapedKey = this.uriEscape(key);
        if (!escapedKey) return undefined;
        
        if (Array.isArray(value)) {
          return value.map(v => `${escapedKey}=${this.uriEscape(v)}`).sort().join(`&${escapedKey}=`);
        }
        return `${escapedKey}=${this.uriEscape(value as string)}`;
      })
      .filter((v): v is string => v !== undefined)
      .join('&');
  }

  /**
   * 获取需要签名的请求头
   */
  private getSignHeaders(headers: Record<string, string>, needSignHeaders: string[] = []): [string, string] {
    const trimHeaderValue = (header: unknown): string => {
      return header?.toString?.().trim().replace(/\s+/g, ' ') ?? '';
    };

    // 基本需要忽略的头部
    const HEADER_KEYS_TO_IGNORE = new Set([
      "authorization",
      "content-type",
      "content-length",
      "user-agent",
      "presigned-expires",
      "expect",
    ]);

    let headerKeys = Object.keys(headers);
    
    // 根据 needSignHeaders 过滤
    if (Array.isArray(needSignHeaders)) {
      const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
      headerKeys = headerKeys.filter((k) => needSignSet.has(k.toLowerCase()));
    }
    
    // 根据 ignore headers 过滤
    headerKeys = headerKeys.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
    
    const signedHeaderKeys = headerKeys
      .slice()
      .map((k) => k.toLowerCase())
      .sort()
      .join(';');
      
    const canonicalHeaders = headerKeys
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map((k) => `${k.toLowerCase()}:${trimHeaderValue(headers[k])}`)
      .join('\n');
      
    return [signedHeaderKeys, canonicalHeaders];
  }

  /**
   * ArrayBuffer 转换为字符串（浏览器环境安全版本）
   */
  private arrayBufferToString(buffer: ArrayBuffer | Uint8Array): string {
    // 在浏览器环境中避免使用 Buffer
    if (typeof Buffer !== 'undefined' && buffer instanceof Buffer) {
      return buffer.toString('binary');
    }
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return String.fromCharCode(...uint8Array);
  }

  /**
   * ArrayBuffer 转换为十六进制字符串（浏览器环境安全版本）
   */
  private arrayBufferToHex(buffer: ArrayBuffer | Uint8Array): string {
    // 在浏览器环境中避免使用 Buffer
    if (typeof Buffer !== 'undefined' && buffer instanceof Buffer) {
      return buffer.toString('hex');
    }
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 生成签名
   */
  public async generateSignature(params: SignParams): Promise<SignatureResult> {
    const {
      method,
      path,
      query = {},
      headers = {},
      body = '',
      timestamp = this.getCurrentTimestamp()
    } = params;

    // 设置必要的时间戳头
    headers['X-Date'] = timestamp;

    // 创建正规化请求
    const [signedHeaders, canonicalHeaders] = this.getSignHeaders(headers);
    const canonicalQuery = this.formatQueryParams(query);
    
    const canonicalRequest = [
      method.toUpperCase(),
      path,
      canonicalQuery,
      `${canonicalHeaders}\n`,
      signedHeaders,
      await this.hash(body)
    ].join('\n');

    // 创建签名字符串
    const date = timestamp.substring(0, 8);
    const credentialScope = [date, this.region, this.serviceName, "request"].join('/');
    const stringToSign = ["HMAC-SHA256", timestamp, credentialScope, await this.hash(canonicalRequest)].join('\n');

    // 计算签名
    const kDate = await this.hmac(this.secretAccessKey, date);
    const kRegion = await this.hmac(this.arrayBufferToString(kDate), this.region);
    const kService = await this.hmac(this.arrayBufferToString(kRegion), this.serviceName);
    const kSigning = await this.hmac(this.arrayBufferToString(kService), "request");
    const signature = await this.hmac(this.arrayBufferToString(kSigning), stringToSign);

    const signatureHex = this.arrayBufferToHex(signature);

    const authorization = [
      "HMAC-SHA256",
      `Credential=${this.accessKeyId}/${credentialScope},`,
      `SignedHeaders=${signedHeaders},`,
      `Signature=${signatureHex}`
    ].join(' ');

    return {
      authorization,
      timestamp,
      signedHeaders
    };
  }

  /**
   * 为 axios 请求添加签名
   */
  public async signAxiosRequest(config: any): Promise<any> {
    const { method = 'GET', url = '/', params = {}, data = '', headers = {} } = config;
    
    // 解析 URL 路径
    const urlObj = new URL(url, 'https://dummy.com');
    const path = urlObj.pathname;
    
    // 合并查询参数
    const query = { ...params };
    
    // 生成签名
    const signatureResult = await this.generateSignature({
      method,
      path,
      query,
      headers,
      body: typeof data === 'string' ? data : JSON.stringify(data)
    });

    // 更新请求配置
    return {
      ...config,
      headers: {
        ...headers,
        'X-Date': signatureResult.timestamp,
        'Authorization': signatureResult.authorization
      }
    };
  }

  /**
   * 基础签名方法（兼容旧版本）
   */
  public async signRequest(method: string, url: string, headers: Record<string, string>, body: string = ''): Promise<any> {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const query: Record<string, string> = {};
    
    // 解析查询参数
    urlObj.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const signatureResult = await this.generateSignature({
      method,
      path,
      query,
      headers,
      body
    });

    return {
      method,
      url,
      headers: {
        ...headers,
        'X-Date': signatureResult.timestamp,
        'Authorization': signatureResult.authorization
      },
      body
    };
  }
}

// 默认导出实例
export const volcengineSigner = new VolcengineAPISigner();

// 导出工具函数
export const signRequest = async (config: any) => await volcengineSigner.signAxiosRequest(config);

export default volcengineSigner;