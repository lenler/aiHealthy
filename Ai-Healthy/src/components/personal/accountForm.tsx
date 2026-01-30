import {Modal, Form, Input ,Row,Col, message} from 'antd'
import { getAccountInfo, updateAccountInfo } from '../../api/person';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
interface propsType{
  isModle:boolean,
  setModleDown:()=>void,
  userId:number|string,
}
export default function AccountForm({isModle,setModleDown,userId}:propsType) {
  const updateUserInfo=useAuthStore((state:any)=>state.updateUserInfo)
  const [loading,setLoading]=useState(false)
  const [form]=Form.useForm()
  // 点击确认提交表单
  const handleOk = async () => {
    setLoading(true)
    try {
      const success = await submitForm()
      if (success) {
        setModleDown()
      }
    } finally {
      setLoading(false)
    }
    setModleDown()
  };
  // 点击取消关闭模态框
  const handleCancel = () => {
    setModleDown()
  };
  async function submitForm(){
    if(!userId) {
      message.error('用户信息缺失，无法提交');
      return false;
    }
    try {
      const values = await form.validateFields();
      // 发送更新请求
      await updateAccountInfo(userId,values)
      message.success('更新成功')
      // 更新状态
      updateUserInfo(values.nickName)
      return true
    } catch (error) {
      console.error('Validate Failed:', error);
      return false
    }
  }
  //请求账户数据
  useEffect(()=>{
    async function getAccount(userId:number|string) {
      try{
        const res=await getAccountInfo(userId)
        const data = res.data.data
        form.setFieldsValue(data)
      }catch(err){
        message.error('获取用户信息失败')
        console.log(err)
      }
    }
    if (isModle && userId) {
      getAccount(userId)
    }
  },[userId, isModle, form])
  return (
    <div>
        <Modal
        height={500}
        title="修改用户信息"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModle}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        >
        <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        form={form}
      >
        <Row gutter={16}>
          <Col span={24}>
             <Form.Item
                label="用户名" 
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input disabled />
              </Form.Item>
          </Col> 
          <Col span={24}>
             <Form.Item
                label="昵称" 
                name="nickName"
                rules={[{ required: true, message: '请输入昵称!' }]}
              >
                <Input />
              </Form.Item>
          </Col> 
          <Col span={24}>
            <Form.Item
                label="邮箱" 
                name="email"
                rules={[{ required: true, message: '请输入新邮箱!' }]}
              >
                <Input/>
              </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
                label="电话" 
                name="tel"
                rules={[{ required: true, message: '请输入新的电话!' }]}
              >
                <Input/>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
    </div>
  )
}
