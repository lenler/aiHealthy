import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { registerApi } from '../../api/sgin_up';
const styleFont = { fontFamily: '"Comic Sans MS", cursive' };

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleRegister = () => {
    form.validateFields().then((values) => {
      console.log('Register values:', values);
      // TODO: Implement registration logic
      registerApi(values).then((res) => {
        if (res.data.code === 200) {
          navigate('/login');
        } else {
          console.error('Registration failed:', res.message);
        }
      });
    }).catch((err) => {
      console.error('Validation failed:', err);
    });
  };

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
          <p className="login-subtitle" style={styleFont}>创建您的健康账户</p>
        </div>

        <Form
          form={form}
          name="register"
          initialValues={{ remember: true }}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { max: 20, message: '用户名长度不能超过20个字符' },
              {pattern:/^[a-zA-Z0-9_.-]+$/,message:"用户名只能包含字母、数字、下划线、点和短横线"}
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { max: 20, message: '邮箱长度不能超过20个字符' },
              {pattern:/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,message:"请输入正确的邮箱格式"}
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="可绑定邮箱"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="tel"
            rules={[
              { max: 20, message: '手机号长度不能超过20个字符' },
              {pattern:/^1[3456789]\d{9}$/,message:"请输入正确的手机号格式"}
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="可绑定手机号"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="nickName"
            rules={[
              { required: true, message: '请输入昵称' },
              { max: 20, message: '昵称长度不能超过20个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="请输入昵称"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { pattern: /^(?=.*[A-Za-z])(?=(?:.*\d){6}).+$/, message: '密码必须包含至少一个字母和六位数字' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="请输入密码"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="请确认密码"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              block
              size="large"
              onClick={handleRegister}
            >
              立即注册
            </Button>
          </Form.Item>

          <div className="register-link">
            已有账号？<a onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}
