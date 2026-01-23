// import { CameraOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card ,Flex,message, Switch, Avatar} from 'antd'
import { Sender,Actions, Bubble  } from '@ant-design/x';
import React, { useEffect, useState,useCallback  } from 'react';
import { PaperClipOutlined} from '@ant-design/icons';

const SwitchTextStyle = {
  display: 'inline-flex',
  width: 28,
  justifyContent: 'center',
  alignItems: 'center',
};

export default function Chat() {
  const [deepThink, setDeepThink] = useState<boolean>(true);
  const [content, setContent] = React.useState('');
  // const locale = useLocale();
  // const [provider] = React.useState(
  //   new DefaultChatProvider<ChatOutput | ChatInput | SystemMessage, ChatInput, ChatOutput>({
  //     request: XRequest('http://localhost:3001/api/chat', {
  //       manual: true,
  //     }),
  //   }),
  // );
  // Chat messages

  return (
    <div id="page-chat" className="page-container active">
      <Card className="header-simple">
        <h2 className="header-title">AI 营养顾问</h2>
        <div className="header-status">● 在线</div>
      </Card>
      {/* 对话区域 */}
      <div className="chat-area">
        <Flex vertical style={{ height: 720 }} gap="small">
          
        </Flex>
      </div>
      <Sender
        // loading={isRequesting}
        value={content}
        onChange={setContent}
        // onCancel={abort}
        // placeholder={locale.placeholder}
        // onSubmit={(nextContent) => {
        //   onRequest({
        //     stream: false,
        //     role: 'user',
        //     query: nextContent,
        //   });
        //   setContent('');
        // }}
        footer={() => {
          return (
            <Flex justify="space-between" align="center">
              <Flex gap="small" align="center">
                {/* 上传图片按钮 */}
                <Button style={{fontSize:16}} type="text" icon={<PaperClipOutlined />} onClick={() => {
                  message.info('Click upload!');
                }} />
                <Switch
                  value={deepThink}
                  checkedChildren={
                    <div>
                      Deep Think:<span style={SwitchTextStyle}>on</span>
                    </div>
                  }
                  unCheckedChildren={
                    <div>
                      Deep Think:<span style={SwitchTextStyle}>off</span>
                    </div>
                  }
                  onChange={(checked: boolean) => {
                    setDeepThink(checked);
                  }}
                />
              </Flex>
            </Flex>
          );
        }}
        autoSize={{ minRows: 1, maxRows: 6 }}
      >
      </Sender>
    </div>
  )
}
