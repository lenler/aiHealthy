import {Modal,  Form, Input ,Row,Col,Radio} from 'antd'
import { updateRecord,createRecord } from '../../api/dashboard/index'
import { useEffect } from 'react'
export interface FieldType{
    type:number,//后面映射成对应关系
    name:string,
    calories:number,
    img:string
}

interface RecordCardProps {
  showCancel:()=>void,
  isModalOpen:boolean,
  type: string;        // 标识餐次类型 (breakfast, lunch, dinner)
  name: string;     // 食物名称列表
  calories: number;    // 总热量
  imageUrl?: string;   // 食物图片 (可选)
  setDataNull:()=>void;
  setData:(type:string,name:string,calories:number)=>void;
  refresh:()=>void;
  isUpdate:boolean;
}
export default function RecordForm({showCancel,isModalOpen,
  type, 
  name, 
  calories,
  imageUrl, 
  setDataNull,
  setData,
  refresh,
  isUpdate
}:RecordCardProps) {
  // 有个失误 餐次应该是不可编辑的
  const [form]=Form.useForm<FieldType>()


  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue({
        type: type === 'breakfast' ? 1 : type === 'lunch' ? 2 : 3,
        name: name,
        calories: calories,
        img: imageUrl
      })
    }
  }, [isModalOpen, type, name, calories, imageUrl, form])

  // 点击确认提交表单
  const handleOk = async () => {
    try {
      // 判断是新增还是更新
      if(isUpdate){
        console.log('更新操作');
        
        const values = await form.validateFields();
        // 更新本地状态
        setData(type, values.name, values.calories);
        // 发送请求
        await updateData(type, {name: values.name, calories: values.calories});
        showCancel();
      }else{
        console.log('新增操作');
        
        const values = await form.validateFields();
        // 更新本地状态
        setData(type, values.name, values.calories);
        // 发送请求
        await createNewRecord(type, values.name, values.calories);
        showCancel();
      }
      
    } catch (error) {
      console.log('表单校验失败:', error);
    }
  };
  // 点击取消关闭模态框
  const handleCancel = () => {
    showCancel();
    setDataNull()
  };

  // 更新指定记录 迫于无奈 只能将刷新数据的函数写在这了
  async function updateData(type:string,data:{name:string,calories:number}) {
    try{
      const res=await updateRecord(type,data)
      console.log(res.data.data);
      // 刷新数据
      refresh()
    }catch(error){
      console.log(error)
    }
  }

  // 新增指定记录
  async function createNewRecord(type:string,name:string,calories:number) {
    try{
      const res=await createRecord({type,name,calories})
      console.log(res.data.data);
      refresh()
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div>
        <Modal
        title="记录饮食"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
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
            <Col span={12}>
             <Form.Item
                label="餐次"
                name="type" 
                rules={[{ required: true, message: '请选择餐次!' }]}  
              >
                <Radio.Group disabled>
                  <Radio value={1}>早餐</Radio>
                  <Radio value={2}>午餐</Radio>
                  <Radio value={3}>晚餐</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          <Col span={12}>
             <Form.Item
                label="名称" 
                name="name"
                rules={[{ required: true, message: '请输入食物名称!' }]}
              >
                <Input />
              </Form.Item>
          </Col> 
          <Col span={12}>
            <Form.Item
                label="卡路里" 
                name="calories"
                rules={[{ required: true, message: '请输入卡路里!' },{pattern:/^[1-9]\d*$/,message:'请输入正确的卡路里!' }]}
              >
                <Input />
              </Form.Item>
          </Col>
          {/*由于技术原因 暂时不考虑上传图片 等待后续技术迭代
           <Col span={12}>
            <Form.Item
                label="图片" 
                name="img"
                rules={[{ required: true, message: '请输入图片!' }]}
              >
                <Upload {...props}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
          </Col> */}
        </Row>
        
      </Form>
        </Modal>
    </div>
  )
}
