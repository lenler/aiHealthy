import{get,post,put}from'../../utils/http/require'

/**
 * 获取首页大屏数据
 * @returns 
 */
export function getOverview(userId:string){
    return get(`/api/dashboard/${userId}`)
}

export function createRecord(data:any){
    return post('/api/dashboard',data)
}

// 更新今日指定餐次数据
export function updateRecord(type:string,data:any){
    return put(`/api/dashboard/${type}`,data)
}


