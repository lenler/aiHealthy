import { Avatar,Card ,Flex,message} from 'antd'
import { Actions, Sender,Bubble} from '@ant-design/x';
import React, {useEffect, useState} from 'react';
import { AntDesignOutlined,DeleteOutlined} from '@ant-design/icons';
import { useChat} from '@ai-sdk/react';
import { getChatHistory, deleteChatHistory } from '../../api/chat';
import useAuthStore from '../../store/authStore';
import type { GetRef } from 'antd';

const actionItems = (content: string, onConfirmDelete: () => void) => [
  {
    key: 'copy',
    label: 'copy',
    actionRender: () => {
      return <Actions.Copy text={content} />;
    },
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <DeleteOutlined />,
    onItemClick: () => {
      onConfirmDelete();
    },
    danger: true,
  }
];

export default function Chat() {
  const nickname=localStorage.getItem('nickName')
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = React.useState('');
  const userId = useAuthStore((state:any)=>state.userId)|| sessionStorage.getItem('userId')
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);
  const { messages, sendMessage, status, setMessages } = useChat({
    api: '/api/chat',
    onFinish: () => {  
      setLoading(false);
      console.log('AI 回复已完成');
      // 重新获取最新的聊天记录以确保有正确的 ID
      if (userId) {
         getChatHistory({userId}).then(res => {
            if (res.data.data) {
                setMessages(res.data.data);
            }
         });
      }
    },
    onError: (err) => {      
      setLoading(false);
      message.error(`发生错误: ${err.message}`);
    }
  });

  const handleDeleteMessage = async (msgId: string | number) => {
    try {
        await deleteChatHistory(msgId);
        // 更新本地状态，移除已删除的消息
        setMessages(messages.filter(m => m.id !== msgId));
        message.success('删除成功');
    } catch (error) {
        console.error(error);
        message.error('删除失败');
    }
  };
  
  // 在进入页面的时候获取聊天记录 然后渲染
  useEffect(() => {
    async function fetchHistory() {
      try {
        if (!userId) {
          message.error('缺少用户信息，请重新登录');
          return;
        }
        const res = await getChatHistory({userId});
        // res.data.data 现在直接就是我们后端转换后的数组
        if (res.data.data) {
          setMessages(res.data.data);
        }
      } catch (error) {
        message.error('获取历史记录失败');
        console.error(error);
      }
    }
    fetchHistory();
    listRef.current?.scrollTo({ top: 'bottom', behavior: 'smooth' })
  }, [setMessages, userId]);
  return (
    <div id="page-chat" className="page-container active">
      <Card className="header-simple">
        <h2 className="header-title">AI 营养顾问</h2>
        <div className="header-status">● 在线</div>
      </Card>
      {/* 对话区域 */}
      <div className="chat-area">
        <Flex vertical style={{ height: 720 }} gap="small">
          {messages.map((message)=>{
            return (
              <div  className="whitespace-pre-wrap">
                {(message.parts || []).map((part, i) => {
                  switch (part.type) {
                    case 'text':
                    return <Bubble
                      placement={message.role === 'user' ? "end" : 'start'}
                      key={`${i}`}
                      content={part.text}
                      typing={{ effect: 'fade-in' }}
                      header={message.role === 'user'?<h5>{nickname}</h5>:<h5>健康助手</h5>}
                      footer={(content,) => (
                        <>
                          <Actions items={actionItems(content, () => handleDeleteMessage(message.id))} onClick={() => console.log(content)} />
                        </>
                      )}
                      avatar={<Avatar icon={<AntDesignOutlined />} />}
                      />
                    default:
                      return null;
                  }
                })}
             </div>
            )
          })
          }
        </Flex>
      </div>
      <Sender
        loading={loading}
        value={input}
        onChange={(value)=>{
          setInput(value)
        }}
        onCancel={() => {
          setLoading(false);
        }}
        placeholder='请输入你想问的问题'
        onSubmit={() => {
          if (!input.trim()) return;
          if (!userId) {
            message.error('缺少用户信息，请重新登录');
            return;
          }
          if (status === 'streaming' || status === 'submitted') return;
          setLoading(true);
          sendMessage({ text: input }, { body: { userId } });
          setInput('');
          listRef.current?.scrollTo({ top: 'bottom', behavior: 'smooth' })
        }}
        autoSize={{ minRows: 1, maxRows: 6 }}
      >
      </Sender>
    </div>
  )
}
