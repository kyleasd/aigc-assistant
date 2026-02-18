import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';


// 创建 axios 实例
const instance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回数据
    return response.data;
  },
  (error) => {
    // 统一错误处理
    let errorMsg = '请求失败';

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMsg = '未授权，请重新登录';
          // 可以添加登出逻辑
          break;
        case 403:
          errorMsg = '权限不足';
          break;
        case 404:
          errorMsg = '请求的资源不存在';
          break;
        case 500:
          errorMsg = '服务器内部错误';
          break;
        default:
          errorMsg = error.response.data?.message || `请求失败 (${error.response.status})`;
      }
    } else if (error.request) {
      errorMsg = '网络连接异常';
    } else {
      errorMsg = error.message || '未知错误';
    }

    message.error(errorMsg);
    return Promise.reject(error);
  }
);

// 通用请求函数
export const req = {
  // GET 请求
  get: <T = any>(url: string, params?: any, config?: AxiosRequestConfig) => {
    return instance.get<T>(url, { params, ...config });
  },

  // POST 请求
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return instance.post<T>(url, data, config);
  },

  // PUT 请求
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return instance.put<T>(url, data, config);
  },

  // DELETE 请求
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return instance.delete<T>(url, config);
  },

  // PATCH 请求
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return instance.patch<T>(url, data, config);
  },
};

export default req;