import { Card, Progress, Row, Col, Typography, Avatar, Button} from 'antd'

const { Title, Text } = Typography

export default function DashBorad() {
  return (
    <div id="page-home" className="page-container active" style={{ padding: '40px 20px 20px',backgroundColor:'#fafefb' }}>
      {/* Header Section */}
      <div className="header-top" style={{ marginBottom: '20px'}}>
        <Row gutter={16} align="middle">
          <Col span={20}>
            <div className="greeting">
              <Text type="secondary">2024年1月20日 星期六</Text>
              <Title level={2} style={{ margin: 0 }}>早安，张三</Title>
            </div>
          </Col>
          <Col span={4}>
            <Avatar size={48} className="user-avatar" />
          </Col>
        </Row>
      </div>

      {/* Dashboard Card */}
      <Card style={{ marginBottom: '20px', borderRadius: '16px' }} bordered={false}>
        <Row align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={10} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="ring-container">
              <Progress
                type="circle"
                percent={70}
                size={120}
                strokeColor="#10b981"
                trailColor="#e2e8f0"
                format={() => (
                  <div className="ringText" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <strong style={{ fontSize: '24px', color: '#1f2937' }}>842</strong>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>可摄入</span>
                  </div>
                )}
              />
            </div>
          </Col>

          <Col xs={24} sm={14} md={16}>
            <div className="macro-stats">
              <div className="macro-item" style={{ marginBottom: '12px' }}>
                <Row justify="space-between" style={{ marginBottom: '4px' }}>
                  <Text>碳水</Text>
                  <Text type="secondary">45/120g</Text>
                </Row>
                <Progress
                  className="macroProgress"
                  percent={37}
                  showInfo={false}
                  strokeColor="#fbbf24"
                  trailColor="#e2e8f0"
                  size="small"
                />
              </div>
              <div className="macro-item" style={{ marginBottom: '12px' }}>
                <Row justify="space-between" style={{ marginBottom: '4px' }}>
                  <Text>蛋白质</Text>
                  <Text type="secondary">60/100g</Text>
                </Row>
                <Progress
                  className="macroProgress"
                  percent={60}
                  showInfo={false}
                  strokeColor="#f87171"
                  trailColor="#e2e8f0"
                  size="small"
                />
              </div>
              <div className="macro-item">
                <Row justify="space-between" style={{ marginBottom: '4px' }}>
                  <Text>脂肪</Text>
                  <Text type="secondary">15/40g</Text>
                </Row>
                <Progress
                  className="macroProgress"
                  percent={37}
                  showInfo={false}
                  strokeColor="#60a5fa"
                  trailColor="#e2e8f0"
                  size="small"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Today's Record Section */}

      <Card className="header-top" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <Card style={{marginBottom:'20px'}} >
        <Row>
        <Title level={3} style={{margin:'0 auto',fontFamily:'"Comic Sans MS", cursive'}}>今日记录</Title>
        </Row>
        <Row title='今日' gutter={[24, 16]}>
          <Col span={8} title='早餐'>
            1
          </Col>
          <Col span={8} title='午餐'>
            2
          </Col>
          <Col span={8} >3</Col>
        </Row>
      </Card>
      <Card>
        <Row>
        <Title level={3} style={{margin:'0 auto',fontFamily:'"Comic Sans MS", cursive'}}>昨天记录</Title>
        </Row>
        <Row title='昨日' gutter={[24, 16]}>  
          <Col span={8} title='早餐'>
            1
          </Col>
          <Col span={8} title='午餐'>
            2
          </Col>
          <Col span={8} >3</Col>
        </Row>
      </Card>
        <Row gutter={[24, 16]} style={{marginTop:'20px',}}>
          <Col span={8}>
            <Button size='large' type='primary' style={{width:'100%',backgroundColor:'#10b981',fontFamily:'"Comic Sans MS", cursive'}}>新增记录</Button>
          </Col>
          <Col span={8} >
            <Button size='large' style={{width:'100%',backgroundColor:'#fbbf24',fontFamily:'"Comic Sans MS", cursive'}}>修改记录</Button>
          </Col>
          <Col span={8} >
            <Button size='large' danger style={{width:'100%',backgroundColor:'#f87171',fontFamily:'"Comic Sans MS", cursive'}}>
              删除记录
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

