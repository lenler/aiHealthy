import { Card ,Avatar, Button} from "antd";
import { useNavigate } from "react-router";
import useAuthStore from "../../store/authStore";
import { useState } from "react";
import AccountForm from "../../components/personal/accountForm";
import HealthyForm from "../../components/personal/healthyForm";

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
  return (
    <div id="page-me" className="page-container active">
      <Card className="profile-card">
        <Avatar className="avatar-large"></Avatar>
        <h2>{nickName}</h2>
        <p className="profile-subtitle">希望你的每一天都如此健康</p>
        <div className="stat-row">
          <div className="stat-item">
            <h3>72.5</h3><span>当前(kg)</span>
          </div>
          <div className="stat-item">
            <h3>65.0</h3><span>目标(kg)</span>
          </div>
            <div className="stat-item">
            <h3>12</h3><span>打卡(天)</span>
          </div>
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
