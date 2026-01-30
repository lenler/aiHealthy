import {Modal, Form, Input ,Row,Col,Radio, message} from 'antd'
import { createHealthyInfo, getHealthyInfo, updateHealthyInfo } from '../../api/person';
import { useEffect, useState } from 'react';
interface propsType{
  isModle:boolean,
  setModleDown:()=>void,
  userId:number|string,
}
export default function HealthyForm({isModle,setModleDown,userId}:propsType) {
  const [healthy,setHealthy]=useState<any>(null)
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
  };
  // 点击取消关闭模态框
  const handleCancel = () => {
    setModleDown()
  };
  // 提交表单
  async function submitForm(){
    if(!userId) {
      message.error('用户信息缺失，无法提交');
      return false;
    }
    try {
      const values = await form.validateFields();
      if(!healthy || Object.keys(healthy).length === 0){
        // 发送新增请求
        await createHealthyInfo(userId,values)
        message.success('记录成功')
      }else{
        // 发送更新请求
        await updateHealthyInfo(userId,values)
        message.success('更新成功')
      }
      // 提交成功后可以重新获取数据或清除状态，这里根据业务需求决定
      // 通常不需要手动 setHealthy({})，因为 Modal 关闭了
      return true
    } catch (error) {
      console.error('Validate Failed:', error);
      return false
    }
  }
  //请求账户数据
  useEffect(()=>{
    async function getHealthy(userId:number|string) {
      try{
        const res=await getHealthyInfo(userId)
        const data = res.data.data
        if(data){
          setHealthy(data)
          form.setFieldsValue(data)
        } else {
          setHealthy(null)
          form.resetFields()
        }
      }catch(err){
        message.error('获取用户信息失败')
        console.log(err)
      }
    }
    if (isModle) {
      getHealthy(userId)
    }
  },[userId, isModle, form])
  return (
    <div>
        <Modal
        title="记录饮食"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModle}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          autoComplete="off"
          form={form}
        >
        <Row gutter={16}>
            <Col span={24}>
             <Form.Item
                label="性别"
                name="sex" 
                rules={[{ required: true, message: '请选择性别!' }]}  
              >
                <Radio.Group >
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          <Col span={24}>
             <Form.Item
                label="身高" 
                name="height"
                rules={[{ required: true, message: '请输入身高!' }]}
              >
                <Input />
              </Form.Item>
          </Col> 
          <Col span={24}>
             <Form.Item
                label="年龄" 
                name="age"
                rules={[{ required: true, message: '请输入年龄!' }]}
              >
                <Input />
              </Form.Item>
          </Col> 
          <Col span={24}>
            <Form.Item
              label="体重" 
              name="weight"
              rules={[{ required: true, message: '请输入体重!' }]}
            >
              <Input />
            </Form.Item>
          </Col> 
          <Col span={24}>
            <Form.Item
              label="饮食习惯与身体状况" 
              name="bodyStatus"
              rules={[{ required: true, message: '请输入饮食习惯与身体状况!' }]}
            >
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      </Modal>
    </div>
  )
}
