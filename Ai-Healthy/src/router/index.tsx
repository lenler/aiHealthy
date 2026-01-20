import React from 'react'
import {createBrowserRouter} from 'react-router-dom'
import Personal from '../page/personal'
import Chat from '../page/chat'
import Analysis from '../page/analysis'
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
        element:<Home/>,
        children:[
            {
                path:'',
                element:<DashBoread/>
            },{
                path:'/user',
                element:<Personal/>
            },{
                path:'/Chat',
                element:<Chat/>
            },{
                path:'/Analysis',
                element:<Analysis/>
            }
        ]
    },{
        path:'*',
        element:<NotFound/>
    }
])
export default router