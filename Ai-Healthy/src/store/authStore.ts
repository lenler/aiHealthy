import { create } from "zustand";

const useAuthStore=create((set)=>({
    // 如果localStorage中存在token 则将其赋值给token 否则赋值为空字符串
    token:localStorage.getItem('token')||'',
    isLogin:false,
    userNickName:sessionStorage.getItem('nickName')||'',

    login:(token:string,nickName:string)=>{
        // 登录时将token存储到localStorage中 做持久化处理
        localStorage.setItem('token',token)
        // 登录时将nickName存储到sessionStorage中 做持久化处理
        sessionStorage.setItem('nickName',nickName)
        set({token,isLogin:true,userNickName:nickName})
    },

    logout:()=>{
        localStorage.removeItem('token')
        sessionStorage.removeItem('nickName')
        set({token:'',isLogin:false,userNickName:''})
    }
}))

export default useAuthStore