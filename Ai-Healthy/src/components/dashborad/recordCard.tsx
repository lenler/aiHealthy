import { Card, Typography, Space, Image } from "antd";
import { FireOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface RecordCardProps {
  title: string;       // 餐次名称 (早餐, 午餐, 晚餐)
  items: string[];     // 食物名称列表
  calories: number;    // 总热量
  imageUrl?: string;   // 食物图片 (可选)
}

export default function RecordCard({ title, items, calories, imageUrl }: RecordCardProps) {
  return (
    <Card
      hoverable
      style={{ 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: '12px' }}
      cover={
        <div style={{ height: '140px', overflow: 'hidden', position: 'relative', backgroundColor: '#f5f5f5' }}>
          {imageUrl ? (
            <Image
              alt={title}
              src={imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              wrapperStyle={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#bfbfbf',
              fontSize: '24px'
            }}>
              🥗
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            {title}
          </div>
        </div>
      }
    >
      <div style={{ minHeight: '80px' }}>
        <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          {items.length > 0 ? items.join(' · ') : '暂无记录'}
        </Title>
        <Space align="center" style={{ color: '#6b7280' }}>
          <FireOutlined style={{ color: '#f87171' }} />
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>{calories}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>kcal</Text>
        </Space>
      </div>
    </Card>
  )
} 