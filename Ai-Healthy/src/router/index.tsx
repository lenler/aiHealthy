import React from 'react'
import {createBrowserRouter} from 'react-router-dom'
import Personal from '../page/personal'
import Chat from '../page/chat/index'
import Analysis from '../page/analysis'
import RouterDefence from '../components/routerDefence'
const Login=React.lazy(()=>import('../page/login/index'))
const Home=React.lazy(()=>import('../page/home/index'))
const NotFound=React.lazy(()=>import('../page/NotFound/index'))
const DashBoread=React.lazy(()=>import('../page/DashBoread/index'))
const router=createBrowserRouter([
    {
        path:'/login',
        element:<Login/>
    },
    {
        path:'/',
        element:<RouterDefence>
                <Home/>
        </RouterDefence>,
        children:[
            {
                path:'',
                element:<DashBoread/>
            },{
                path:'/user',
                element:<Personal/>
            },{
                path:'/chat',
                element:<Chat/>
            },{
                path:'/analysis',
                element:<Analysis/>
            },
/*             {
                // 健康档案页面
                path:'/',
                element:<Record/>
            } */
        ]
    },{
        path:'*',
        element:<NotFound/>
    }
])
export default router