import axios from 'axios'

// 用来编写基础的http请求 get post put delete
const http= axios.create({
    baseURL:'https://localhost:8080',
    timeout:300,
})

// 在请求拦截器中 拦截请求并添加请求头
http.interceptors.request.use((config)=>{
    //如果不做处理 就返回config 如果不返回 就会导致请求失败
    //为请求头添加token
    const token=localStorage.getItem('token')
    //如果token不存在 则直接返回config 拒绝请求
    if(!token){
        return config
    }
    //并不是所有页面都需要token
    if(token){
        //http协议中的标准字段 专门用来携带认证信息
        config.headers['Authorization']=`${token}`
    }
    return config
})
export default http
