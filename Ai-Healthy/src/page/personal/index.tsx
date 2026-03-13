import { Card ,Avatar, Button,Upload,message} from "antd";
import { useNavigate } from "react-router";
import useAuthStore from "../../store/authStore";
import { useEffect, useState } from "react";
import AccountForm from "../../components/personal/accountForm";
import HealthyForm from "../../components/personal/healthyForm";
import { getAccountInfo, getAvatarUploadSign, getHealthyInfo, updateAvatar } from "../../api/person";
import type { UploadProps } from 'antd';

interface HealthyInfo{
  userID:number,
  height:number,
  weight:number,
  age:number,
  sex:number,
  bodyStatus:string,
}
const settingItem=[
  {
    key:'account',
    icon:'⚙️',
    title:'修改账号信息 ',
  },
  {
    key:'healthInfo',
    icon:'🧑‍⚕️',
    title:'个人健康信息'
  },
  {
    key: "avatar",
    icon:"😊",
    title:'切换头像'
  },
  {
    key:'logout',
    icon:'🚪',
    title:'退出登录'
  }
]
export default function Personal() {
  const nickName=useAuthStore((state:any)=>state.userNickName)
  const logout=useAuthStore((state:any)=>state.logout)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isHealthyModalOpen, setIsHealthyModalOpen] = useState(false);
  const [healthyInfo, setHealthyInfo] = useState<HealthyInfo>()
  const userId=localStorage.getItem('userId')
  const navigator=useNavigate()
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  /**
   * 封装模态框关闭函数
   */
  function setAccountModleDown(){
    setIsAccountModalOpen(false)
  }
  function setHealthyModleDown(){
    setIsHealthyModalOpen(false)
  }
  // 封装函数 打开模态框并且对于不同的key打开不同的表单
  function openModalForm(key:string){
    if(key==='account'){
      // 打开账号管理表单
      setIsAccountModalOpen(true)
    }else if(key==='healthInfo'){
      // 打开健康信息表单
      setIsHealthyModalOpen(true)
    }
  }
  /**
   * 设置点击事件
   * @param key 
   */
  function handleClick(key:string){
    if(key==='logout'){
      localStorage.removeItem('token')
      localStorage.removeItem('nickName')
      logout()
      navigator('/login')
    }
    else {
      openModalForm(key)
    }
  }
  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    if (!userId) {
      message.error('用户信息缺失');
      onError?.(new Error('用户信息缺失'));
      return;
    }
    try {
      setUploading(true);
      const targetFile = file as File;
      const signRes = await getAvatarUploadSign(targetFile.name);
      const signData = signRes?.data?.data;
      if (!signData?.host || !signData?.policy || !signData?.signature || !signData?.accessid || !signData?.key) {
        throw new Error('签名信息不完整');
      }
      const formData = new FormData();
      formData.append('key', signData.key);
      formData.append('policy', signData.policy);
      formData.append('OSSAccessKeyId', signData.accessid);
      formData.append('Signature', signData.signature);
      formData.append('success_action_status', signData.successActionStatus || '200');
      formData.append('file', targetFile);
      const uploadResp = await fetch(signData.host, {
        method: 'POST',
        body: formData
      });
      if (!uploadResp.ok) {
        throw new Error('OSS上传失败');
      }
      await updateAvatar(userId, {
        avatarUrl: signData.url,
        avatarObjectKey: signData.key
      });
      setAvatarUrl(signData.url);
      message.success('头像上传成功');
      onSuccess?.({}, file as any);
    } catch (error: any) {
      message.error(error?.message || '头像上传失败');
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(()=>{
    async function getUserHealth() {
      const res=await getHealthyInfo(userId!)
      const data = res.data.data
      setHealthyInfo(data)
    }
    async function getUserAccount() {
      const res = await getAccountInfo(userId!);
      const data = res?.data?.data;
      if (data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
      }
    }
    if (!userId) {
      return;
    }
    getUserHealth()
    getUserAccount()
  },[userId])
  return (
    <div id="page-me" className="page-container active">
      <Card className="profile-card">
        <Avatar className="avatar-large" src={avatarUrl || undefined}></Avatar>
        <h2>{nickName}</h2>
        <p className="profile-subtitle">希望你的每一天都如此健康</p>
        <div className="stat-row">
          {
            healthyInfo && (
              <>
                <div className="stat-item">
                  <h3>{healthyInfo.weight}</h3><span>当前体重(kg)</span>
                </div>
                <div className="stat-item">
                  <h3>{healthyInfo.height}</h3><span>当前身高(cm)</span>
                </div>
                <div className="stat-item">
                  <h3>{Number(healthyInfo.weight/(healthyInfo.height*healthyInfo.height/10000)).toFixed(1)}</h3><span>当前bim值</span>
                </div>
              </>
            )
          }
        </div>
        </Card>
        <Card className="settings-list">
          {
            settingItem.map((item)=>{
              if(item.key==="avatar"){
                return(
                  <div className="setting-item setting-btn" key={item.key}>
                    <Upload
                      name="file"
                      customRequest={customRequest}
                      showUploadList={false}
                      maxCount={1}
                      accept="image/*"
                    >
                    <Button loading={uploading} style={{display:'block',width:'100%',height:'100%'}}>
                      <div className="setting-left">
                        <div className="setting-icon">{item.icon}</div>
                        <p>{item.title}</p>
                      </div>
                    </Button>
                  </Upload>
                  </div>
                )
              }else{
                return(
                  <div className="setting-item setting-btn" key={item.key}>
                    <Button style={{display:'block',width:'100%',height:'100%'}} onClick={()=>handleClick(item.key)}>
                      <div className="setting-left">
                        <div className="setting-icon">{item.icon}</div>
                        <p>{item.title}</p>
                      </div>
                    </Button>
                  </div>
                )
              }
            })
          }
      </Card>
      <AccountForm isModle={isAccountModalOpen} setModleDown={setAccountModleDown} userId={userId!}/>
      <HealthyForm isModle={isHealthyModalOpen} setModleDown={setHealthyModleDown} userId={userId!}/>
    </div>
  )
}
