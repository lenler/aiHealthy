import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import router from './router'
// import App from './App.tsx'
// 禁用了mock

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)
