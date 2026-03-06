import { Card ,Avatar, Button} from "antd";
import { useNavigate } from "react-router";
import useAuthStore from "../../store/authStore";
import { useEffect, useState } from "react";
import AccountForm from "../../components/personal/accountForm";
import HealthyForm from "../../components/personal/healthyForm";
import { getHealthyInfo } from "../../api/person";

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
  function handleClick(key:string){
    if(key==='logout'){
      localStorage.removeItem('token')
      localStorage.removeItem('nickName')
      logout()
      navigator('/login')
    }else{
      // 打开模态框
      openModalForm(key)
    }
  }
  useEffect(()=>{
    // 从后端获取用户的健康信息
    async function getUserHealth() {
      const res=await getHealthyInfo(userId!)
      const data = res.data.data
      setHealthyInfo(data)
    }
    getUserHealth()
  },[userId])
  return (
    <div id="page-me" className="page-container active">
      <Card className="profile-card">
        <Avatar className="avatar-large"></Avatar>
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
              return(
                <div className="setting-item setting-btn">
                  <Button style={{display:'block',width:'100%',height:'100%'}} onClick={()=>handleClick(item.key)}>
                    <div className="setting-left">
                      <div className="setting-icon">{item.icon}</div>
                      <p>{item.title}</p>
                    </div>
                  </Button>
                  
                </div>
              )
            })
          }
      </Card>
      <AccountForm isModle={isAccountModalOpen} setModleDown={setAccountModleDown} userId={userId!}/>
      <HealthyForm isModle={isHealthyModalOpen} setModleDown={setHealthyModleDown} userId={userId!}/>
    </div>
  )
}
