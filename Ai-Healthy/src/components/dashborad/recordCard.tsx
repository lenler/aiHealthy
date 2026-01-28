import { Card, Typography, Space, Image, Button, Popconfirm, Tooltip } from "antd";
import { FireOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './index.scss'
const { Text, Title } = Typography;

interface RecordCardProps {
  type: string;        // 标识餐次类型 (breakfast, lunch, dinner)
  title: string;       // 显示标题 (早餐, 午餐, 晚餐)
  name: string;        // 食物名称
  calories: number;    // 总热量
  imageUrl?: string;   // 食物图片 (可选)
  readOnly?: boolean;  // 是否为昨日记录
  onEdit?: (type: string) => void;
  onDelete?: (type: string) => void;
  onAdd?: (type: string) => void;
}
/**
 * 组件操作模式:组件有两个模式 和一个状态 模式:可操作模式,只读模式 状态:是否存在数据 
 * 通过isRead控制是否只读,如果是只读模式,则不显示编辑和删除按钮
 * 通过hasData控制是否存在数据,如果不存在数据,就展示空状态
 * 方法1: onEdit 编辑按钮点击事件 控制模态框 自动填充给你数据
 * 方法2: onDelete 删除按钮点击事件 控制气泡框
 * 方法3: onAdd 新增按钮点击事件 控制模态框 空数据 如果填写数据不能提交
 * 模态框组件放在主页面,通过控制setModalVisible来显示和隐藏
 * @param param0 
 * @returns 
 */
export default function RecordCard({ 
  type, 
  title, 
  name, 
  calories, 
  imageUrl, 
  readOnly = false,
  onEdit,
  onDelete,
  onAdd 
}: RecordCardProps) {
  // 这里只判断该数据是否存在名字和卡路里,如果都不存在,则认为该数据为空 因为我们后端的删除操作不是真的删除 而是将数据的状态设为空
  const hasData = name && calories > 0;
  // 空状态展示 (仅在非只读模式下显示新增按钮)
  if (!hasData) {
    return (
      <Card
        className="noDataCard"
        hoverable={!readOnly}
        onClick={() => !readOnly && onAdd?.(type)}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥗</div>
          <Title level={5} style={{ color: '#64748b', marginBottom: '16px' }}>{title}暂无记录</Title>
          {!readOnly && (
            <Button 
              type="primary" 
              shape="circle" 
              icon={<PlusOutlined />} 
              size="large"
              style={{ backgroundColor: '#10b981', border: 'none' }}
            />
          )}
        </div>
      </Card>
    );
  }
  return (
    <Card
      className='recordCard'
      hoverable
      styles={{ body: { padding: '12px' } }}
      cover={
        <div style={{ height: '140px', overflow: 'hidden', position: 'relative', backgroundColor: '#f5f5f5' }}>
          {imageUrl ? (
            <Image
              alt={title}
              src={imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              styles={{ root: { width: '100%', height: '100%' } }}
              // preview={false}
            />
          ) : (
            <div className='defaultImage' style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#bfbfbf',
              fontSize: '24px'
            }}>
              🍲
            </div>
          )}
          
          {/* 左上角标签 */}
          <div className="recordCardTitle" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#10b981',
            zIndex: 1
          }}>
            {title}
          </div>
          {/* 右上角操作按钮 (只在非只读模式下显示) */}
          {!readOnly && (
            <div className="recordCardActions" style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              gap: '8px',
              zIndex: 2
            }}>
              <Tooltip title="编辑">
                <Button 
                  size="small" 
                  shape="circle" 
                  icon={<EditOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(type);
                  }}
                  className="recordCardActionButton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none' }}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title={`确定要删除今日${title}记录吗？`}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDelete?.(type);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    size="small" 
                    shape="circle" 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none' }}
                  />
                </Popconfirm>
              </Tooltip>
            </div>
          )}
        </div>
      }
    >
      <div style={{ minHeight: '80px' }}>
        <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
          {name}
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