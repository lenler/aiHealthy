import { Card, Progress, Row, Col, Typography, Avatar, Button, Skeleton, Spin} from 'antd'
import dayjs from 'dayjs'
import { getOverview, createRecord, updateRecord, deleteRecord } from '../../api/dashboard/index'
import { useEffect, useState } from 'react'
import RecordCard from '../../components/dashborad/recordCard'
const { Title, Text } = Typography;
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
  items: string[];
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
  const [loading,setLoading]=useState<boolean>(false)
  const [summary,setSummary]=useState<DashboardSummary>()
  const [todayRecord,setTodayRecord]=useState<DailyRecord>()
  const [yesterdayRecord,setYesterdayRecord]=useState<DailyRecord>()
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

  const nickName=sessionStorage.getItem('nickName')
  /**
   * 根据时间处理问候语
   */
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
  /**
   * 使用dayjs库处理时间格式，返回YYYY-MM-DD格式的字符串
   */
  function getTime():string{
    return dayjs().format('YYYY-MM-DD')
  }
  
  /**
   * 编写从后台获取数据的函数用户渲染首页大屏
   */
  async function getOverviewData() {
    setLoading(true)
    try {
      const res = await getOverview()
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
  useEffect(() => {
    getOverviewData()
  }, [])
  return (

    <div id="page-home" className="page-container active" style={{ padding: '40px 20px 20px',backgroundColor:'#fafefb' }}>   
      {loading?<Spin size="large"/>:<div>
          {/* Header Section */}
          <Card className="header-top" style={{ marginBottom: '20px'}}>
            <Row gutter={16} align="middle">
              <Col span={20}>
                <div className="greeting">
                  <Text type="secondary">{getTime()}</Text>
                  <Title level={2} style={{ margin: 0 }}>{getHello()},{nickName}</Title>
                </div>
              </Col>
              <Col span={4}>
                <Avatar size={48} className="user-avatar" />
              </Col>
            </Row>
          </Card>

          {/* Dashboard Card */}
          <Skeleton loading={loading} style={{ marginBottom: '30px', borderRadius: '16px' }}>
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} sm={10} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="ring-container">
                  <Progress
                    type="circle"
                    // 计算百分比 当前摄入量/总摄入量 * 100
                    percent={summary?.calories.current?summary?.calories.current/summary?.calories.target*100:0}
                    size={120}
                    strokeColor="#10b981"
                    trailColor="#e2e8f0"
                    format={() => (
                      <div className="ringText" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <strong style={{ fontSize: '24px', color: '#1f2937' }}>{summary?.calories.current}</strong>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>可摄入</span>
                      </div>
                    )}
                  />
                </div>
              </Col>
              <Col xs={24} sm={14} md={16}>
                <div className="macro-stats">
                  {
                    (['carbs', 'protein', 'fat'] as const).map((item) => {
                      const data = summary?.[item];
                      return (
                        <div key={item} className="macro-item">
                          <Row justify="space-between" style={{ marginBottom: '4px' }}>
                            <Text>{macroLabels[item]}</Text>
                            <Text type="secondary">{data?.current}/{data?.target}{data?.unit}</Text>
                          </Row>
                          <Progress
                            className="macroProgress"
                            // 计算百分比 当前摄入量/总摄入量 * 100
                            percent={data ? (data.current / data.target) * 100 : 0}
                            showInfo={false}
                            strokeColor={item === 'carbs' ? '#fbbf24' : item === 'protein' ? '#60a5fa' : '#10b981'}
                            trailColor="#e2e8f0"
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

          {/* Today's Record Section */}
          <Card className="header-top" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' ,marginTop:'20px'}}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>今日饮食记录</Title>
              <Text type="secondary">记录每一餐，开启健康生活</Text>
            </div>
            
            <Row gutter={[16, 16]}>
              {todayRecord ? (
                (['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                  <Col xs={24} sm={8} key={type}>
                    <RecordCard
                      title={mealLabels[type]}
                      items={todayRecord.meals[type].items}
                      calories={todayRecord.meals[type].calories}
                      imageUrl={todayRecord.meals[type].img}
                    />
                  </Col>
                ))
              ) : (
                <Col span={24}><Skeleton active /></Col>
              )}
            </Row>

            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>昨日回顾</Title>
            </div>

            <Row gutter={[16, 16]}>
              {yesterdayRecord ? (
                (['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                  <Col xs={24} sm={8} key={type}>
                    <RecordCard
                      title={mealLabels[type]}
                      items={yesterdayRecord.meals[type].items}
                      calories={yesterdayRecord.meals[type].calories}
                      imageUrl={yesterdayRecord.meals[type].img}
                    />
                  </Col>
                ))
              ) : (
                <Col span={24}><Skeleton active /></Col>
              )}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
              <Col span={8}>
                <Button 
                  size='large' 
                  type='primary' 
                  block
                  style={{ 
                    borderRadius: '12px',
                    height: '48px',
                    backgroundColor: '#10b981', 
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  新增记录
                </Button>
              </Col>
              <Col span={8}>
                <Button 
                  size='large' 
                  block
                  style={{ 
                    borderRadius: '12px',
                    height: '48px',
                    backgroundColor: '#fbbf24', 
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  修改记录
                </Button>
              </Col>
              <Col span={8}>
                <Button 
                  size='large' 
                  danger 
                  block
                  style={{ 
                    borderRadius: '12px',
                    height: '48px',
                    fontWeight: 'bold'
                  }}
                >
                  删除记录
                </Button>
              </Col>
            </Row>
          </Card>
        </div>}
    </div>
  )
}

