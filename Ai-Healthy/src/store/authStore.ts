import { create } from "zustand";

const useAuthStore=create((set)=>({
    token:'',
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