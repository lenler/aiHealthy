import{get,post,put,deleteReq}from'../../utils/http/require'

/**
 * 获取首页大屏数据
 * @returns 
 */
export function getOverview(userId:string){
    return get(`/api/dashboard/${userId}`)
}

export function createRecord(userId:string,data:any){
    return post(`/api/dashboard/${userId}`,data)
}

// 更新今日指定餐次数据
export function updateRecord(userId:string,data:any){
    return put(`/api/dashboard/${userId}`,data)
}

// 删除今日指定餐次数据
export function removeRecord(userId:string,mealType:string){
    return deleteReq(`/api/dashboard/${userId}`,{mealType})
}


