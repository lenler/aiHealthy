import { useEffect, useState } from 'react';
import {Card,DatePicker,Button,Tag,Space,Avatar,Upload,Select,Table,Progress,message,Statistic,Row,Col,Typography,} from 'antd';
import {CameraOutlined,ReloadOutlined,ThunderboltOutlined,PieChartOutlined,InboxOutlined,} from '@ant-design/icons';
import dayjs from 'dayjs';
import './index.scss';
const {Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;
import type { Key } from 'react';
import type { UploadProps } from 'antd';
import type { Dayjs } from 'dayjs';
import RecordCard from '../../components/analysis/recordCard';
import { createRecord, getMealData, updateRecord, uploadImage} from '../../api/analysis';
type MealSource = 'AI 识别' | '手动录入';
interface MealGroup {
  mealType: string;
  title: string;
  currentCalories: number;
  foodName: string;
  calories: number;
  source: MealSource;
  imgUrl: string;
}
interface AIDraftItem {
  key: Key;
  foodName: string;
  calories: number;
}
const mealGroups: MealGroup[] = [
  {
    mealType: 'Breakfast',
    title: '早餐',
    currentCalories: 320,
    foodName: '鸡胸肉藜麦沙拉',
    calories: 450,
    source: 'AI 识别',
    imgUrl:'https://picsum.photos/200/301',
  },
  {
   mealType: 'Lunch',
    title: '午餐',
    currentCalories: 680,
    foodName: '鸡胸肉藜麦沙拉',
    calories: 450,
    source: 'AI 识别',
    imgUrl:'https://picsum.photos/200/301',
  },
  {
   mealType: 'Dinner',
    title: '晚餐',
    currentCalories: 0,
    foodName: '鸡胸肉藜麦沙拉',
    calories: 450,
    source: 'AI 识别',
    imgUrl:'https://picsum.photos/200/301',
  },
];
const draftColumns = [
  {
    title: '食物名称',
    dataIndex: 'foodName',
    key: 'foodName',
  },
  {
    title: '卡路里',
    dataIndex: 'calories',
    key: 'calories',
  },
];
export default function Analysis() {
  const userId=localStorage.getItem('userId');
  const [mealData,setMealdata]=useState<MealGroup[]>(mealGroups)
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs(new Date()));
  const [mealType, setMealType] = useState<string>("Dinner");
  const [draftData, setDraftData] = useState<AIDraftItem[]>([]);
  const [currentCalories, setCurrentCalories] = useState<number>(0);// 当前卡路里
  const [targetCalories, setTargetCalories] = useState<number>(2000);// 目标卡路里
  const [caloriePercent, setCaloriePercent] = useState<number>(0);// 卡路里占比
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>();
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => setSelectedRowKeys(keys),
    columnTitle: '选择',
  };
  const [imgUrl,setImgUrl]=useState('')
  const isToday = currentDate.format('YYYY-MM-DD') === dayjs(new Date()).format('YYYY-MM-DD');//判断当前选中的日期是否是今日 如果不是 禁用更新数据
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    showUploadList: true,
    accept: 'image/*',
    async customRequest({ file, onSuccess, onError }) {
      const formData = new FormData();
      formData.append('file', file as any);
      try {
        const res = await uploadImage(formData);
        if (res.data.status) {
          // 获取识别结果 识别结果中包含识别到的食物和卡路里 后端返回的结果中返回了上传的url
          const items = Array.isArray(res.data?.data?.items) ? res.data.data.items : [];
          // 获取用于识别的图片地址
          setImgUrl(res.data.data.url || '')
          const nextDraftData: AIDraftItem[] = items.map((it: any, idx: number) => ({
            key: String(idx + 1),
            foodName: String(it?.foodName || '未知'),
            calories: Number.isFinite(it?.calories) ? Math.trunc(it.calories) : parseInt(String(it?.calories || 0), 10) || 0,
          }));
          setDraftData(nextDraftData);
          setSelectedRowKeys(nextDraftData.map((d) => d.key));
          message.success('识别成功');
          onSuccess?.(res.data);
          return;
        }
        message.error(res.data.message || '识别失败');
        onError?.(new Error(res.data.message));
      } catch (err: any) {
        message.error('识别过程中发生错误');
        onError?.(err);
      }
    }
  };
  /**
   * 格式化获取到的三餐数据
   * @param data 
   * @returns 
   */
  function formatMeals(data:any){
    const formatDate:MealGroup[]=data.map((item:any)=>{
      return {
        mealType:item.mealType ,
        title: item.mealType,
        currentCalories:item.calories,
        foodName: item.foodName,
        calories: item.calories,
        source:"AI 识别" ,
        imgUrl: item.imgUrl,
      }
    })
    return formatDate
  }
  /**
   * 获取当日三餐数据
   */
  async function reLoadData(dateStr?: string){
    const currentDateStr = dateStr || currentDate.format('YYYY-MM-DD');
    try{
      // 获取三餐数据 并更新状态 
      const res=await getMealData(userId!,currentDateStr)
      const formattedMeals = formatMeals(res.data.data || [])
      setMealdata(formattedMeals)

      const nextCurrentCalories = formattedMeals.reduce((acc,item)=>acc+item.currentCalories,0);
      setCurrentCalories(nextCurrentCalories);
      setCaloriePercent(Math.floor(nextCurrentCalories/targetCalories*100));
    }catch(err){
      message.error('发生错误,请求数据失败')
      console.log(err);
      setMealdata([]);
      setCurrentCalories(0);
      setCaloriePercent(0);
    }
  }
  /**
   * 确定添加/更新当前一餐数据
   */
  async function handleConfirmAdd(){
    // 确定后将获取的数据整合 然后发送给后端
    let thisFoodName:string=''
    let thisCalories:number=0;
    // 使用set数据结构保证每个记录只会出现一次
    const selectedKeySet = new Set(selectedRowKeys);
    const selectedItems = draftData.filter((item) => selectedKeySet.has(String(item.key)));
    if (selectedItems.length === 0) {
      message.warning('请先选择要添加的食物');
      return;
    }
    selectedItems.forEach((item, index)=>{
      thisFoodName += item.foodName + (index < selectedItems.length - 1 ? '+' : '');
      thisCalories += item.calories;
    })
    //改用some方法来查询是否存在同餐次
    const exists = mealData.some((item) => item.mealType === mealType);
    try{
      if(exists){
        const res=await updateRecord(userId!,{foodName:thisFoodName,calories:thisCalories,mealType:mealType,imgUrl:imgUrl})
        if(!res){
          console.log('请求失败请重新请求');
        }
      }else{
        const res=await createRecord(userId!,{foodName:thisFoodName,calories:thisCalories,mealType:mealType,imgUrl:imgUrl})
        if(!res){
          console.log('请求失败请重新请求');  
        }
      }
    }catch(err){
      message.error('更新失败');
      console.log(err);
    }finally{
      // 清空图片url
      setImgUrl('');
      reLoadData(currentDate.format('YYYY-MM-DD'))
    }
  }
  /**
   * 清空当前草稿数据
   */
  function handleClearDraft(){
    setDraftData([]);
    setSelectedRowKeys([]);
    setImgUrl('');
  };
  useEffect(()=>{
    // 初始化时 刷新数据
    reLoadData(currentDate.format('YYYY-MM-DD'))
  },[])

  return (
    <div id="page-analysis" className="page-container active analysis-page">
      <main className="analysis-main">
        {/* Header Section */}
        <Card className="analysis-top-card">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <div className="date-picker-wrapper">
                <DatePicker
                  allowClear={false}
                  value={currentDate}
                  onChange={(value) => {
                    if(!value){
                      return
                    }
                    setCurrentDate(value)
                    reLoadData(value.format('YYYY-MM-DD'))
                  }}
                  suffixIcon={null}
                  style={{ border: 'none', background: 'transparent', width: 120, textAlign: 'center' }}
                  inputReadOnly
                />
              </div>
          </Row>
        </Card>
        <Row gutter={[24, 24]} className="analysis-layout">
           {/* 左侧: 该日记录: 总摄入量 该日每餐记录 */}
           <Col xs={24} lg={14}>
            <Card
              bordered={false}
              className="analysis-card hover-card"
              title={
                <Space>
                  <Avatar style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} icon={<PieChartOutlined />} />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>当日饮食记录</span>
                </Space>
              }
              extra={
                <Space>
                  <Text type="secondary">目标: {targetCalories}</Text>
                  <Tag color={caloriePercent > 100 ? 'red' : 'green'}>{caloriePercent}%</Tag>
                </Space>
              }
            >
              {/* 该日总摄入量 */}
              <div style={{ marginBottom: 24, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
                <Row align="middle" gutter={24}>
                  <Col span={18}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>今日摄入热量</Text>
                    <Progress
                      percent={caloriePercent}
                      strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                      status="active"
                      format={() => <span style={{ color: '#1890ff' }}>{currentCalories} kcal</span>}
                    />
                  </Col>
                  <Col span={6} style={{ textAlign: 'center', borderLeft: '1px solid #d9d9d9' }}>
                    <Statistic title="剩余额度" value={targetCalories - currentCalories} suffix="kcal"/>
                  </Col>
                </Row>
              </div>
              {/* 该日每餐记录 */}
              <div className="analysis-meals">
                {mealData.map((group) => (
                  <RecordCard key={group.mealType} group={group} />
                ))}
              </div>
            </Card>
           </Col>
           <Col xs={24} lg={10}>
            <Card
              bordered={false}
              className="analysis-card hover-card"
              title={
                <Space>
                  <Avatar style={{ backgroundColor: '#f6ffed', color: '#52c41a' }} icon={<CameraOutlined />} />
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>AI 智能识别</Text>
                </Space>
              }
            >
              <Dragger {...uploadProps} style={{ marginBottom: 24, padding: 32, background: '#fafafa', border: '2px dashed #d9d9d9', borderRadius: 12 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#13ec5b', fontSize: 48 }} />
                </p>
                <p className="ant-upload-text">点击或拖拽上传饮食照片,上传后立即识别</p>
                <p className="ant-upload-hint">支持 JPG、PNG 格式，识别更精准</p>
              </Dragger>
              <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Select
                      value={mealType}
                      onChange={setMealType}
                      style={{ width: '100%', height: 30}}
                      size="large"
                      placeholder="选择餐次"
                    >
                      <Option value="Breakfast">早餐</Option>
                      <Option value="Lunch">午餐</Option>
                      <Option value="Dinner">晚餐</Option>
                    </Select>
                  </Col>
                </Row>
              </div>

              {/* Draft Results */}
              <Card
                size="small"
                title={`识别结果 (${draftData.length})`}
                extra={"识别不准确可重新识别"}
                style={{ background: '#f9f9f9', borderRadius: 8 }}
              >
                <Table
                  size="small"
                  rowKey="key"
                  columns={draftColumns}
                  dataSource={draftData}
                  pagination={false}
                  rowSelection={rowSelection}
                  style={{ marginBottom: 16 }}
                />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    block
                    onClick={handleConfirmAdd}
                    disabled={!isToday}
                    style={{ height: 40, borderRadius: 20 ,backgroundColor:'#13ec5b'}}
                  >
                    确认添加到 {mealType}
                  </Button>
                  <Button block danger onClick={handleClearDraft} disabled={!draftData.length} style={{ borderRadius: 20,backgroundColor:'#ff4d4f' }}>
                    清空结果
                  </Button>
                </Space>
              </Card>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
}
