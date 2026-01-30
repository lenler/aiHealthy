import { get, deleteReq } from "../../utils/http/require";

export function getChatHistory(params:any){
    return get('/api/chat',params)
}

export function deleteChatHistory(id: string | number) {
    return deleteReq(`/api/chat/${id}`);
}
