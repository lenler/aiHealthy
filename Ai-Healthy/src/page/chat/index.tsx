import { Avatar, Card, Flex, message, Skeleton } from "antd";
import { Actions, Sender, Bubble } from "@ant-design/x";
import React, { useEffect, useState } from "react";
import { RobotOutlined, DeleteOutlined } from "@ant-design/icons";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getChatHistory, deleteChatHistory } from "../../api/chat";
import useAuthStore from "../../store/authStore";
import { XMarkdown } from "@ant-design/x-markdown";

const actionItems = (content: string, onConfirmDelete: () => void) => [
  {
    key: "copy",
    label: "copy",
    actionRender: () => {
      return <Actions.Copy text={content} />;
    },
  },
  {
    key: "delete",
    label: "Delete",
    icon: <DeleteOutlined />,
    onItemClick: () => {
      onConfirmDelete();
    },
    danger: true,
  },
];

export default function Chat() {
  const nickname = useAuthStore((state: any) => state.userNickName);
  const avatarUrl = useAuthStore((state: any) => state.avatarUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = React.useState("");
  const token = useAuthStore((state: any) => state.token);
  const userId = useAuthStore((state: any) => state.userId);
  // 聊天区滚动容器（.chat-area）
  const scrollRef = React.useRef<HTMLDivElement>(null); //绑定聊天区域
  // 记录用户是否“贴近底部”（贴底时：新消息自动滚到底；看历史时：不强制打断）
  const isNearBottomRef = React.useRef(true);
  // 防止“滚到顶部加载更多”被连续触发
  const isLoadingMoreRef = React.useRef(false);
  // 合并多次滚动到底部的调度，避免频繁触发 layout
  const scrollRafRef = React.useRef<number | null>(null);
  // 反向虚拟列表（窗口化渲染）配置：
  // - WINDOW_SIZE：只渲染窗口内的 N 条消息，控制 DOM 数量
  // - LOAD_STEP：向上翻历史时，每次把窗口向前扩展多少条
  // - TOP/BOTTOM_THRESHOLD：判断是否接近顶部/底部
  const WINDOW_SIZE = 80;
  const LOAD_STEP = 40;
  const TOP_THRESHOLD = 80;
  const BOTTOM_THRESHOLD = 160;
  // windowStart：当前渲染窗口在 messages 数组中的起始下标
  const [windowStart, setWindowStart] = useState(0);
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    }),
    onFinish: () => {
      setLoading(false);
      console.log("AI 回复已完成");
      // 重新获取最新的聊天记录以确保有正确的 ID
      if (userId) {
        getChatHistory({ userId }).then((res) => {
          if (res.data.data) {
            setMessages(res.data.data);
          }
        }).finally(() => setIsStreaming(false));
      } else {
        setIsStreaming(false);
      }
    },
    onError: (err) => {
      setLoading(false);
      setIsStreaming(false); // 结束流式传输
      message.error(`发生错误: ${err.message}`);
    },
  });
  const [isStreaming, setIsStreaming] = useState(false); // 是否正在流式传输中

  const LoadingComponents = {
    "loading-link": () => (
      <Skeleton.Button
        active
        size="small"
        style={{ margin: "4px 0", width: 16, height: 16 }}
      />
    ),
    "loading-image": () => (
      <Skeleton.Image active style={{ width: 60, height: 60 }} />
    ),
  };
  const scrollToBottom = (behavior?: "auto" | "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    if (behavior) {
      //设置滑动style 将滑动效果改为平缓滑动 或是自动
      el.scrollTo({ top: el.scrollHeight, behavior });
      return;
    }
    el.scrollTop = el.scrollHeight; // 把这个滚动容器直接滚到最底部 。 el.scrollHeight ：内容总高度
  };
  const visibleMessages = React.useMemo(() => {
    // 窗口化渲染：只渲染 messages 的一个切片，避免消息过多导致渲染卡顿
    return messages.slice(windowStart, windowStart + WINDOW_SIZE); // 用来截取数组中用来渲染的部分
  }, [messages, windowStart]);
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearTop = el.scrollTop < TOP_THRESHOLD;
    const nearBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight) < BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    // 如果用户滚回到底部：窗口立即切回“最新的 N 条”，并贴底
    if (nearBottom) {
      const maxStart = Math.max(0, messages.length - WINDOW_SIZE);
      if (windowStart !== maxStart) {
        setWindowStart(maxStart);
        window.requestAnimationFrame(() => scrollToBottom());
        return;
      }
    }
    // 如果用户滚到顶部：把窗口向更早的历史扩展（一次 LOAD_STEP 条）
    // 为了不让视口跳动：记录扩展前的 scrollHeight，扩展后用差值补偿 scrollTop
    if (nearTop && windowStart > 0 && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;
      const nextStart = Math.max(0, windowStart - LOAD_STEP);
      setWindowStart(nextStart);
      window.requestAnimationFrame(() => {
        const nextEl = scrollRef.current;
        if (nextEl) {
          const nextScrollHeight = nextEl.scrollHeight;
          nextEl.scrollTop =
            prevScrollTop + (nextScrollHeight - prevScrollHeight);
        }
        isLoadingMoreRef.current = false;
      });
    }
  };
  const sendMsg = () => {
    if (!input.trim()) return;
    if (!token) {
      message.error("缺少登录凭证，请重新登录");
      return;
    }
    if (!userId) {
      message.error("缺少用户信息，请重新登录");
      return;
    }
    if (status === "streaming" || status === "submitted") return;
    setLoading(true);
    setIsStreaming(true);
    sendMessage(
      {
        text: input,
      },
      {
        body: { userId },
        headers: {
          Authorization: token,
        },
      },
    );
    setInput("");
    window.requestAnimationFrame(() => scrollToBottom("smooth")); //： 把“滚动到底部”的动作延迟到下一帧执行
  };
  const handleDeleteMessage = async (msgId: string | number) => {
    try {
      await deleteChatHistory(msgId);
      // 更新本地状态，移除已删除的消息
      setMessages(messages.filter((m) => m.id !== msgId));
      message.success("删除成功");
    } catch (error) {
      console.error(error);
      message.error("删除失败");
    }
  };

  // 在进入页面的时候获取聊天记录 然后渲染
  useEffect(() => {
    async function fetchHistory() {
      try {
        if (!userId) {
          message.error("缺少用户信息，请重新登录");
          return;
        }
        const res = await getChatHistory({ userId });
        // res.data.data 现在直接就是我们后端转换后的数组
        if (res.data.data) {
          setMessages(res.data.data);
        }
      } catch (error) {
        message.error("获取历史记录失败");
        console.error(error);
      }
    }
    fetchHistory();
    window.requestAnimationFrame(() => scrollToBottom("smooth")); // 把“滚动到底部”的动作延迟到下一帧执行
  }, [setMessages, userId]);
  useEffect(() => {
    if (!isNearBottomRef.current) return;
    // 贴底状态下：messages 变长时，让窗口跟随到最新的 N 条
    const nextStart = Math.max(0, messages.length - WINDOW_SIZE);
    setWindowStart(nextStart);
  }, [messages.length]);
  useEffect(() => {
    // 兜底：当 messages 变短（比如删消息）时，保证 windowStart 不越界
    const maxStart = Math.max(0, messages.length - WINDOW_SIZE);
    if (windowStart > maxStart) setWindowStart(maxStart);
  }, [messages.length, windowStart]);
  useEffect(() => {
    if (!isNearBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    if (scrollRafRef.current != null) return;
    // 贴底状态下：消息（包括流式 chunk）更新时，合并到下一帧再滚到底部
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      scrollToBottom();
    });
  }, [messages, isStreaming]);

  return (
    <div id="page-chat" className="page-container active">
      <Card className="header-simple">
        <h2 className="header-title">AI 营养顾问</h2>
        <div className="header-status">● 在线</div>
      </Card>
      {/* 对话区域 */}
      <div className="chat-area" ref={scrollRef} onScroll={handleScroll}>
        {!loading && messages.length === 0 ? (
          <Flex vertical align="center" justify="center" style={{ height: 360 }}>
            <h3 style={{ color: '#999', marginBottom: 8 }}>试着问问 AI 你今天该怎么吃吧~</h3>
            <p style={{ color: '#bbb' }}>例如："我今天早餐吃了什么"、"帮我分析今日营养"</p>
          </Flex>
        ) : (
        <Flex vertical style={{ height: 720 }} gap="small">
          {visibleMessages.map((message) => {
            return (
              <div className="whitespace-pre-wrap" key={message.id}>
                {(message.parts || []).map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Bubble
                          placement={message.role === "user" ? "end" : "start"}
                          key={`${message.id}-${i}`}
                          content={part.text}
                          contentRender={(content) => (
                            <XMarkdown
                              // className={className}
                              content={content as string}
                              paragraphTag="div"
                              streaming={{
                                hasNextChunk: isStreaming,
                                enableAnimation: true, // 开启动画
                                incompleteMarkdownComponentMap: {
                                  link: "loading-link",
                                  image: "loading-image",
                                },
                              }}
                              components={LoadingComponents}
                            />
                          )}
                          typing={{ effect: "fade-in" }}
                          header={
                            message.role === "user" ? (
                              <h5>{nickname}</h5>
                            ) : (
                              <h5>健康助手</h5>
                            )
                          }
                          footer={(content) => (
                            <>
                              <Actions
                                items={actionItems(content, () =>
                                  handleDeleteMessage(message.id),
                                )}
                                onClick={() => console.log(content)}
                              />
                            </>
                          )}
                          avatar={message.role === "user" ? <Avatar src={avatarUrl || undefined} /> : <Avatar style={{ backgroundColor: '#10b981', color: '#fff' }} icon={<RobotOutlined />} />}
                        />
                      );
                    case "tool-call":
                    case "tool-invocation":
                      return (
                        <Bubble
                          placement="start"
                          key={`${message.id}-${i}`}
                          content={`${(part as any).toolName ? `正在调用 ${(part as any).toolName}...` : '正在分析...'}`}
                          avatar={<Avatar style={{ backgroundColor: '#10b981', color: '#fff' }} icon={<RobotOutlined />} />}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            );
          })}
        </Flex>
        )}
      </div>
      <Sender
        loading={loading}
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onCancel={() => {
          setLoading(false);
        }}
        placeholder="请输入你想问的问题"
        onSubmit={sendMsg}
        autoSize={{ minRows: 1, maxRows: 6 }}
      ></Sender>
    </div>
  );
}
