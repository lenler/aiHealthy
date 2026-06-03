import { get, post, put } from "../../utils/http/require";
import http from "../../utils/http/http";

export function getAccountInfo(userId:number|string){
    return get(`/api/person/accountInfo/${userId}`)
}

export function getHealthyInfo(userId:number|string){
    return get(`/api/person/healthyInfo/${userId}`)
}

export function updateHealthyInfo(userId:number|string,data:any){
    return put(`/api/person/healthyInfo/${userId}`,data)
}

export function updateAccountInfo(userId:number|string,data:any){
    return put(`/api/person/accountInfo/${userId}`,data)
}
export function createHealthyInfo(userId:number|string,data:any){
    return post(`/api/person/healthyInfo/${userId}`,data)
}

export function uploadAvatar(formData: FormData) {
    return http.post('/api/person/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function updateAvatar(userId:number|string,data:any){
    return put(`/api/person/avatar/${userId}`,data)
}
