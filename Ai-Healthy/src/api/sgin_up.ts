import { post } from "../utils/http/require";

export function registerApi(data:any){
  return post('/api/sign_up',data)
}
