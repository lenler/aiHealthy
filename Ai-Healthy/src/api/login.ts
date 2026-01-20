import { post } from '../utils/http/require';

interface loginParams{
  username:string,
  password:string,

}

export function loginApi(data:loginParams){
    return post('/login',data)
}