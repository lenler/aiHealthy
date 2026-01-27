import{post,put}from'../../utils/http/require'
import http from '../../utils/http/http'
// 为了规范这里我们就不直接调用首页的路由了 不过大差不差 只是名字不一样
export function getMealData(userId:string,currentDate:string){
    return post(`/api/analysis/dashborad/${userId}`,{currentDate})
}

export function createRecord(userId:string,data:any){
    return post(`/api/analysis/${userId}`,data)
}

// 更新今日指定餐次数据
export function updateRecord(userId:string,data:any){
    return put(`/api/analysis/${userId}`,data)
}

// 上传图片
export function uploadImage(formData: FormData) {
    return http.post('/api/analysis/upload', formData,{
        headers: { 'Content-Type': 'multipart/form-data' } // 声明文件上传格式
      })
}

