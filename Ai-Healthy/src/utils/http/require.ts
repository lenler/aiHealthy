import http from './http'

interface APIResponse{
    code:number,
    message:string,
    data:any
}

export function get(url:string,params?:any):Promise<APIResponse>{
    return http.get(url,{params})
}

export function post(url:string,data?:any):Promise<APIResponse>{
    return http.post(url,data)
}
