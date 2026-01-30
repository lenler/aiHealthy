import http from './http'

interface APIResponse{
    code:number,
    message:string,
    data:any
}

export function get(url:string,params?:any, config:any = {}):Promise<APIResponse>{
    return http.get(url,{params, ...config})
}

export function post(url:string,data?:any):Promise<APIResponse>{
    return http.post(url,data)
}

export function put(url:string,data?:any,):Promise<APIResponse>{
    return http.put(url,data,)
}

export function deleteReq(url:string,params?:any,):Promise<APIResponse>{
    return http.delete(url,{params})
}