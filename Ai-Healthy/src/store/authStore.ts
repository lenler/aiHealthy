import { create } from "zustand";

const useAuthStore=create((set)=>({
    // 如果localStorage中存在token 则将其赋值给token 否则赋值为空字符串
    token:localStorage.getItem('token')||'',
    isLogin:false,

    login:(token:string)=>{
        // 登录时将token存储到localStorage中 做持久化处理
        localStorage.setItem('token',token)
        set({token,isLogin:true})
    },

    logout:()=>{
        localStorage.removeItem('token')
        set({token:'',isLogin:false})
    }
}))

export default useAuthStore