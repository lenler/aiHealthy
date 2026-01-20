import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import './index.scss';
import { loginApi } from '../../api/login';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
const styleFont= {fontFamily:'"Comic Sans MS", cursive'}

interface loginParams{
  username:string,
  password:string
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form]=Form.useForm()
  const login=useAuthStore((state:any) => state.login);//从zustand中获取login函数
  const navigator=useNavigate()

  useEffect(()=>{
    //如果用户已经登录 则跳转到首页
    if(localStorage.getItem('token')){
      navigator('/')
    }
  },[navigator])

  /**
   * 登录函数
   * 1. 校验表单数据
   * 2. 调用登录接口
   * 3. 登录成功后将token和昵称存到redux和sessionStorage中
   */
  function handleLogin(){
    form.validateFields().then( async (value:loginParams)=>{
      const res=await loginApi({
        username:value.username,
        password:value.password
      })
      const {nickname,token}=res.data.data
      login(token)
      sessionStorage.setItem('nickname',nickname)
      setLoading(false)
      message.success('登录成功')
      //登录成功后跳转到首页
      navigator('/')
    }).catch((err)=>{
      setLoading(false)
      message.error(err.message)
    }) 
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="health-circle circle-1"></div>
        <div className="health-circle circle-2"></div>
        <div className="health-circle circle-3"></div>
      </div>
      
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="logo-container">
            <HeartOutlined className="logo-icon" />
          </div>
          <h1 className="login-title" style={styleFont}>Healthier</h1>
          <p className="login-subtitle" style={styleFont}>智能健康，美好生活</p>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' },{max:20,message:'用户名长度不能超过20个字符'}]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="请输入邮箱或手机号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
          <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div className="form-actions">
              <a className="forgot-password" href="#">
                忘记密码？
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              block
              size="large"
              onClick={handleLogin}
            >
              登录
            </Button>
          </Form.Item>

          <div className="register-link">
            还没有账号？<a href="#">立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}
