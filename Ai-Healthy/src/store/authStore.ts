import { create } from "zustand";

const useAuthStore=create((set)=>({
    // 如果localStorage中存在token 则将其赋值给token 否则赋值为空字符串
    token:localStorage.getItem('token')||'',
    isLogin:false,
    userNickName:localStorage.getItem('nickName')||'',
    userId:localStorage.getItem('userId')||'',

    login:(token:string,nickName:string,userId:string)=>{
        // 登录时将token存储到localStorage中 做持久化处理
        localStorage.setItem('token',token)
        // 登录时将nickName存储到localStorage中 做持久化处理
        localStorage.setItem('nickName',nickName)
        localStorage.setItem('userId',userId)
        set({token,isLogin:true,userNickName:nickName,userId})
    },

    logout:()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('nickName')
        localStorage.removeItem('userId')
        set({token:'',isLogin:false,userNickName:'',userId:''})
    },

    updateUserInfo:(nickName:string)=>{
        set({userNickName:nickName})
        localStorage.setItem('nickName',nickName)
    }
}))

export default useAuthStore
