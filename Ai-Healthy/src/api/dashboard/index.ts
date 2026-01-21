import{get,post,put,deleteReq}from'../../utils/http/require'

/**
 * 获取首页大屏数据
 * @returns 
 */
export function getOverview(){
    return get('/dashboard')
}

export function createRecord(data:any){
    return post('/records',data)
}

// 更新今日指定餐次数据
export function updateRecord(type:string,data:any){
    return put(`/records/${type}`,data)
}

// 删除今日指定餐次数据
export function deleteRecord(type:string){
    return deleteReq(`/records/${type}`)
}
