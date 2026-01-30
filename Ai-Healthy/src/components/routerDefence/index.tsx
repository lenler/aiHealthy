import React, { useEffect } from 'react'
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
/**
 * 路由守卫高阶组件
 * 1. 检查用户是否登录
 * 2. 如果用户未登录 则跳转到登录页
 * 3. 如果用户已登录 则渲染子组件
 * @returns 
 */
export default function RouterDefence({children}:{children:React.ReactNode}) {
  const navigator=useNavigate()
  // 获取用户登录状态 检查token是否存在 先从redux中获取 token
  const token=useAuthStore((state:any) => state.token);
  useEffect(()=>{
    // 如果token为空 则跳转到登录页
    if(token===''||!token){
      navigator('/login')
    }else{
      // 如果token存在返回首页
      navigator('/')
    }
  },[token,navigator])
  return (
    <div>{children}</div>
  )
}
