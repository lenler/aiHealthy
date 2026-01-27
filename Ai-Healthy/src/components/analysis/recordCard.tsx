import {Card,Button,Tag,Space,message,Typography,} from 'antd';
import {EditOutlined,DeleteOutlined,FireOutlined,PlusOutlined} from '@ant-design/icons';
const { Text } = Typography;

export default function RecordCard({group}:{group:any}) {
  return (
    <Card key={group.mealType} className="meal-section">
    <div className="meal-section-header">
        <Space>
        <div className={`meal-icon-wrapper ${group.mealType.toLowerCase()}`}>
            {group.mealType === 'Breakfast' && <img src="https://cdn-icons-png.flaticon.com/512/887/887359.png" alt="breakfast" />}
            {group.mealType === 'Lunch' && <img src="https://cdn-icons-png.flaticon.com/512/2082/2082058.png" alt="lunch" />}
            {group.mealType === 'Dinner' && <img src="https://cdn-icons-png.flaticon.com/512/4669/4669353.png" alt="dinner" />}
        </div>
        <span className="meal-title">{group.title}</span>
        </Space>
        <div className="meal-calories-badge">
        <Text strong>{group.currentCalories}</Text>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 2 }}>kcal</Text>
        </div>
    </div>
    
    <div className="meal-section-body">
        {group.currentCalories > 0 ? (
        <Card
            hoverable
            className="food-item-card"
            cover={
            <div className="food-image-wrapper">
                <img
                draggable={false}
                alt={group.foodName}
                src={group.imgUrl}
                />
                <div className="food-actions">
                <Button size="small" shape="circle" icon={<EditOutlined />} />
                <Button size="small" shape="circle" danger icon={<DeleteOutlined />} />
                </div>
            </div>
            }
        >
            <div className="food-info">
            <div className="food-header">
                <Text strong className="food-name">{group.foodName}</Text>
                <Tag color={group.source === 'AI 识别' ? 'cyan' : 'blue'} bordered={false}>
                {group.source}
                </Tag>
                <Text type="secondary" className="food-calories">
                    <FireOutlined style={{ color: '#ff4d4f', marginLeft:10}} />
                    {group.calories} kcal
                </Text>
            </div>
            </div>
        </Card>
        ) : (
        <div className="empty-meal-placeholder" onClick={() => message.info(`添加${group.title}记录`)}>
            <PlusOutlined style={{ fontSize: 24, color: '#d9d9d9', marginBottom: 8 }} />
            <Text type="secondary">记录{group.title}</Text>
        </div>
        )}
    </div>
    </Card>
  )
}
