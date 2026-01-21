import { CameraOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'

export default function Chat() {
  return (
    <div id="page-chat" className="page-container active">
      <div className="header-simple">
        <h2 className="header-title">AI 营养顾问</h2>
        <div className="header-status">● 在线</div>
      </div>

      <div className="chat-area">
        <div className="chat-bubble bubble-ai">
          你好！我是你的专属 AI 营养师。今天的午餐看起来很健康，需要我分析一下鸡胸肉沙拉的微量元素吗？
        </div>
        <div className="chat-bubble bubble-user">好的，帮我分析一下这顿饭的蛋白质含量。</div>
        <div className="chat-bubble bubble-ai">
          <strong>分析结果完成：</strong>
          <br />
          一份标准鸡胸肉沙拉（约300g）通常包含：
          <ul className="bubble-list">
            <li>蛋白质：约 35g ✅</li>
            <li>脂肪：约 12g</li>
            <li>膳食纤维：约 6g</li>
          </ul>
          <br />
          这非常适合你目前的减脂目标！建议晚上补充一些优质碳水。
        </div>
      </div>
      <div className="chat-input-bar">
        <Button className="action-icon" aria-label="拍照" icon={<CameraOutlined />} />
        <Input className="input-field" placeholder="输入问题或上传食物照片..." />
        <Button className="action-icon action-send" aria-label="发送" icon={<SendOutlined />} />
      </div>
    </div>
  )
}
