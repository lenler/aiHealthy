import { Card, Progress, Row, Col, Typography, Avatar, Skeleton, Spin} from 'antd'
import dayjs from 'dayjs'
import { getOverview, removeRecord} from '../../api/dashboard/index'
import { useEffect, useState } from 'react'
import RecordCard from '../../components/dashborad/recordCard'
import './index.scss'
const { Title, Text } = Typography;
import RecordForm from '../../components/dashborad/recordForm'

export interface MacroInfo {
  current: number;
  target: number;
  unit: string;
}
/**
 * 仪表盘汇总数据
 */
export interface DashboardSummary {
  carbs: MacroInfo;     // 碳水
  protein: MacroInfo;   // 蛋白质
  fat: MacroInfo;       // 脂肪
  calories: MacroInfo;  // 总能量 
  totalIntake: number;  // 已摄入总量
}
/**
 * 单餐记录详情
 */
export interface MealRecord {
  name: string;
  calories: number;
  img:string;
}
/**
 * 每日餐次集合
 */
export interface Meals {
  breakfast: MealRecord;
  lunch: MealRecord;
  dinner: MealRecord;
}
/**
 * 每日饮食记录
 */
export interface DailyRecord {
  date: string;
  meals: Meals;
}
/**
 * 首页综合数据响应结构
 */
export interface DashboardOverviewData {
  summary: DashboardSummary;
  todayRecord: DailyRecord;
  yesterdayRecord: DailyRecord;
}
export default function DashBorad() {
  const nickName=localStorage.getItem('nickName')
  const [loading,setLoading]=useState<boolean>(true)
  const [summary,setSummary]=useState<DashboardSummary>()
  const [todayRecord,setTodayRecord]=useState<DailyRecord>()
  const [yesterdayRecord,setYesterdayRecord]=useState<DailyRecord>()
  const [isModalOpen, setIsModalOpen] = useState(false);//控制模态框
  const labels=['breakfast', 'lunch', 'dinner']//餐次类型
  const Macros=['carbs', 'protein', 'fat']//营养成分类型
  const [type,setType]=useState<string>('breakfast')//当前操作的餐次类型
  const [name,setName]=useState<string>('')//当前操作的餐次名称
  const [calories,setCalories]=useState<number>(0)//当前操作的餐次热量
  const [isUpdate,setIsUpdate]=useState<boolean>(false)//是否是更新操作
  // 定义索引的映射关系
  const macroLabels: Record<string, string> = {
    carbs: '碳水',
    protein: '蛋白质',
    fat: '脂肪'
  };
  const mealLabels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐'
  };
  const userId=localStorage.getItem('userId')
  /**
   * 辅助函数
   * 获取指定记录的餐次名称,热量,图片的函数
   * 获取当前时间,格式化YYYY-MM-DD格式
   * 按照时间输出对应的问候语
   */
  // 辅助函数 获取营养成分名
  function getMacroName(summary: DashboardSummary | undefined, macro: string) {
    if (!summary) return undefined;
    if (macro === 'carbs') {
      return summary.carbs
    } else if (macro === 'protein') {
      return summary.protein
    } else {
      return summary.fat
    }
  }
  // 辅助函数 获取餐次名称
  function getMealName(record:DailyRecord,type:string){
    if(type=='breakfast'){
      return record.meals.breakfast.name
    }else if(type=='lunch'){
      return record.meals.lunch.name
    }else{
      return record.meals.dinner.name
    }
  }
  // 辅助函数 获取餐次热量
  function getCalories(record:DailyRecord,type:string){
    if(type=='breakfast'){
      return record.meals.breakfast.calories
    }else if(type=='lunch'){
      return record.meals.lunch.calories
    }else{
      return record.meals.dinner.calories
    }
  }

  // 辅助函数 获取餐次图片
  function getMealImg(record:DailyRecord,type:string){
    if(type=='breakfast'){
      return record.meals.breakfast.img
    }else if(type=='lunch'){
      return record.meals.lunch.img
    }else{
      return record.meals.dinner.img
    }
  } 
  function getHello(){
    const date=new Date()
    const hour=date.getHours()
    if(hour<12){
      return '早安'
    }else if(hour<18){
      return '下午好'
    }else{
      return '晚上好'
    }
  }
  function getTime():string{
    return dayjs().format('YYYY-MM-DD')
  }
  /**
   * 新增、编辑、删除记录的业务操作函数
   * 点击新增,编辑弹出模态
   * 数据设置逻辑: 点击修改之后-->先获取当前的数据并设置到表单中-->然后再模态框中{
   *      if(如果点击取消) 则清空数据避免影响到新增或修改操作
   *      else if(如果点击确认) 则根据表单数据更新各数据的状态通过组件通信 更新记录并在主页页面发送请求 刷新数据
   * }
   */
  // 辅助函数 设置新增记录数据为空
  function setDataNull(){
    setType('breakfast')
    setName(mealLabels['breakfast'])
    setCalories(0)
  }
  // 辅助函数 设置记录数据
  function setData(type:string,name:string,calories:number){
    setType(type)
    setName(name)
    setCalories(calories)
  }
  // 点击新增,新增记录
  const handleAdd = (type: string) => {
    console.log('新增操作',type);
    setType(type)
    setIsUpdate(false)
    setIsModalOpen(true);
  };
  // 点击编辑,编辑指定记录
  const handleEdit =(type: string) => {
    setIsUpdate(true)
    setType(type)
    setName(getMealName(todayRecord!,type))
    setCalories(getCalories(todayRecord!,type))
    setIsModalOpen(true);
  };
  // 点击删除,删除指定记录
  const handleDelete = async (type: string) => {
    console.log('删除记录:', type);
    await deleteRecord(type)
    refresh()
  };
  // 点击取消,关闭模态框
  const showCancel = () => {
    setIsModalOpen(false);
  };
  function refresh(){
    getOverviewData()
  }
  /**
   * 编写从后台获取/刷新数据的函数
   */
  // 获取/刷新首页大屏数据
  async function getOverviewData() {
    setLoading(true)
    try {
      const res = await getOverview(userId!)
      const data = res.data.data
      setSummary(data.summary)
      setTodayRecord(data.todayRecord)
      setYesterdayRecord(data.yesterdayRecord)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  async function deleteRecord(type:string){
    try{
      if(!userId) return
      const res=await removeRecord(userId, type)
      console.log(res.data.data);
      refresh()
    }catch(error){
      console.log(error)
    }
  }
  useEffect(() => {
    getOverviewData()
  }, [])
  return (
    <div id="page-home" className="page-container active">
      {loading?<Spin size="large"/>:<div>
          {/* 欢迎头 */}
          <Card className="header-top">
            <Row gutter={16} align="middle">
              <Col span={20}>
                <div className="greeting">
                  <Text type="secondary">{getTime()}</Text>
                  <Title level={2}>{getHello()},{nickName}</Title>
                </div>
              </Col>
              <Col span={4}>
                <Avatar size={48} className="user-avatar" />
              </Col>
            </Row>
          </Card>

          {/* 汇总数据卡片 */}
          <Skeleton loading={loading}>
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} sm={10} md={8} className="ring-container">
                <Progress
                  type="circle"
                  // 计算百分比 当前摄入量/总摄入量 * 100
                  percent={summary?.calories.current?summary?.calories.current/summary?.calories.target*100:0}
                  size={120}
                  strokeColor="#10b981"
                  railColor="#e2e8f0"
                  format={() => (
                    <div className="ringText">
                      <strong>{summary?.calories.current}</strong>
                      <span>可摄入</span>
                    </div>
                  )}
                />
              </Col>
              {/* 宏元素统计卡片 */}
              <Col xs={24} sm={14} md={16}>
                <div className="macro-stats">
                  {
                    Macros.map((item) => {
                      const data = getMacroName(summary, item);
                      return (
                        <div key={item} className="macro-item">
                          <div className="macro-header">
                            <Text>{macroLabels[item]}</Text>
                            <Text type="secondary">{data?.current || 0}/{data?.target || 0}{data?.unit || ''}</Text>
                          </div>
                          <Progress
                            className="macroProgress"
                            // 计算百分比 当前摄入量/总摄入量 * 100
                            percent={data ? (data.current / data.target) * 100 : 0}
                            showInfo={false}
                            strokeColor={item === 'carbs' ? '#fbbf24' : item === 'protein' ? '#60a5fa' : '#10b981'}
                            railColor="#e2e8f0"
                            size="small"
                          />
                        </div>
                      )
                    })
                  }
                </div>
              </Col>
            </Row>
          </Skeleton>

          {/* 饮食记录卡片 */}
          <Card className="diet-card">
            <div className="section-title">
              <Title level={4}>今日饮食记录</Title>
              <Text type="secondary">记录每一餐，开启健康生活</Text>
            </div>
            {/* 三餐记录卡片 */}
            <Row gutter={[16, 16]}>
              {todayRecord ? (
                (['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                  <Col xs={24} sm={8} key={type}>
                    <RecordCard
                      type={type}
                      title={mealLabels[type]}
                      name={getMealName(todayRecord!,type)}
                      calories={getCalories(todayRecord!,type)}
                      imageUrl={getMealImg(todayRecord!,type)}
                      onAdd={()=>handleAdd(type)}
                      onEdit={()=>handleEdit(type)}
                      onDelete={handleDelete}
                    />
                  </Col>
                ))
              ) : (
                <Col span={24}><Skeleton active /></Col>
              )}
            </Row>

            <div className="yesterday-section">
              <Title level={4}>昨日回顾</Title>
            </div>
            {/* 昨日三餐记录卡片 */}
            <Row gutter={[16, 16]}>
              {yesterdayRecord ? (
                labels.map((type) => (
                  <Col xs={24} sm={8} key={type}>
                    <RecordCard
                      type={type}
                      title={mealLabels[type]}
                      name={getMealName(yesterdayRecord!,type)}
                      calories={getCalories(yesterdayRecord!,type)}
                      imageUrl={getMealImg(yesterdayRecord!,type)}
                      readOnly={true}
                    />
                  </Col>
                ))
              ) : (
                <Col span={24}><Skeleton active /></Col>
              )}
            </Row>
          </Card>
        </div>}
        {/* 模态框 */}
        <RecordForm showCancel={showCancel} isModalOpen={isModalOpen} type={type||'breakfast'} name={name||''} calories={calories||0} setDataNull={setDataNull} setData={setData} refresh={refresh} isUpdate={isUpdate} userId={userId||''}/> 
    </div>
  )
}

