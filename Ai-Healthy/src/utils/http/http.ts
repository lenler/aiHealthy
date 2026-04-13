import axios from "axios";

// 用来编写基础的http请求 get post put delete
const http = axios.create({
  baseURL: "http://localhost:3080",
  timeout: 10000,
});

// 存储 pending 的请求
const pendingRequests = new Map();

// 生成请求 key
const generateRequestKey = (config: any) => {
  return `${config.method}-${config.url}`;
};

// 在请求拦截器中 拦截请求并添加请求头
http.interceptors.request.use(
  (config) => {
    // 拦截重复请求 (只针对 POST 请求，保证第一次上传成功)
    if (config.method === "post") {
      const key = generateRequestKey(config);
      if (pendingRequests.has(key)) {
        return Promise.reject(new Error("请勿重复提交请求"));
      }
      pendingRequests.set(key, true);
    }
    //如果不做处理 就返回config 如果不返回 就会导致请求失败
    //为请求头添加token
    const token = localStorage.getItem("token");
    //如果token不存在 则直接返回config 拒绝请求
    if (!token) {
      return config;
    }
    //并不是所有页面都需要token
    if (token) {
      //http协议中的标准字段 专门用来携带认证信息
      config.headers["Authorization"] = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    if (response.config.method === "post") {
      const key = generateRequestKey(response.config);
      pendingRequests.delete(key);
    }
    return response;
  },
  (error) => {
    if (error.config && error.config.method === "post") {
      const key = generateRequestKey(error.config);
      pendingRequests.delete(key);
    }
    return Promise.reject(error);
  },
);

export default http;
