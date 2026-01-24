import { get } from "../../utils/http/require";

export function getChatHistory(){
    return get('/api/chat') //api是在vite中转发的后台接口
}   