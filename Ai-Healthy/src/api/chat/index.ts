import { get } from "../../utils/http/require";

export function getChatHistory(params:any){
    return get('/api/chat',params)
}
