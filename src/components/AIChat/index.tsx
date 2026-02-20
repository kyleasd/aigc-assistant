import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Input, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Message, useStore } from '../../store/useStore';
import { videoAPI } from '@/apis/index';
import './aichat.css';

export default function AIChat() {
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const setMessages = useStore((s) => s.setMessages);
  const setLoading = useStore((s) => s.setLoading);
  const loading = useStore((s) => s.loading);
  const [inputValue, setInputValue] = useState('');
  const [taskId, setTaskId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const taskIdRef = useRef<string>('');

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 当 taskId 变化时，更新 taskIdRef
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const newUserMessage: Message = {
        id: String(Date.now()),
        content: inputValue,
        role: 'user',
        isLoading: false,
        timestamp: new Date(),
      };

      addMessage(newUserMessage);
      setInputValue('');
      setLoading(true);
      // const res = await videoAPI.submitJimeng3_0Pro1080P(newUserMessage.content);
      // const res = await videoAPI.submitJimeng3_0_1080P(newUserMessage.content);
      const res = await videoAPI.submitJimeng3_0_720P(newUserMessage.content);
      
      // 确保 res 是有效的对象
      if (!res || typeof res !== 'object') {
        throw new Error('Invalid response from API');
      }
      let content = ''
      // 处理后端返回的数据结构
      if (res.status === 50430) {
        content = '请求太快了，请稍后再试'
      } else if (res.status === 10000) {
        const { task_id } = res.data
        content = `请求成功，任务ID: ${task_id}`
        setTaskId(task_id || '');
        // 直接更新 taskIdRef，确保立即反映最新值
        taskIdRef.current = task_id || '';
      }

      const newAIMessage: Message = {
        id: String(Date.now() + 1),
        content: content,
        role: "assistant",
        isLoading: content ? false : true,
        timestamp: new Date(),
      };

      addMessage(newAIMessage);

      // 清除之前可能存在的定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // 只有在获取到 taskId 时才设置定时器
      if (taskIdRef.current) {
        timerRef.current = setInterval(() => {
          getResult();
        }, 2000);
      }
    } catch (error) {
      console.error('handleSendMessage: ', error);
      const newAIMessage: Message = {
        id: String(Date.now() + 1),
        content: '任务提交失败，请稍后再试',
        role: "assistant",
        isLoading: false,
        timestamp: new Date(),
      };
      addMessage(newAIMessage);
    } finally {
      setLoading(false);
    }
  };

  const getResult = async () => {
    const currentTaskId = taskIdRef.current;
    if (!currentTaskId) return;
    try {
      // const res = await videoAPI.getJimeng3_0Pro1080PResult(currentTaskId);
      // const res = await videoAPI.getJimeng3_0_1080PResult(currentTaskId);
      const res = await videoAPI.getJimeng3_0_720PResult(currentTaskId);
      
      if (res.data.status === 'done') {
        
        const newMessage: Message = {
          id: String(Date.now()),
          content: res.data.local_video_url ?? '',
          role: 'assistant',
          isLoading: false,
          timestamp: new Date()
        };
        addMessage(newMessage);

        // 当任务完成时清除定时器
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (res.data.status === 'downloading') {
        // 更新消息内容，显示下载中状态
        setMessages(prevMessages => {
          // 确保 prevMessages 是数组
          if (!Array.isArray(prevMessages)) {
            console.error('prevMessages is not an array:', prevMessages);
            return [];
          }
          const updatedMessages = [...prevMessages];
          if (updatedMessages.length > 0) {
            updatedMessages[updatedMessages.length - 1].content = 'downloading';
            // 保持加载状态为 true
          }
          return updatedMessages;
        });
        // 不清除定时器，继续轮询
      }
    } catch (error) {
      console.error('getResult:', error);
      // 异常时清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // 更新消息状态
      setMessages(prevMessages => {
        // 确保 prevMessages 是数组
        if (!Array.isArray(prevMessages)) {
          console.error('prevMessages is not an array:', prevMessages);
          return [];
        }
        const updatedMessages = [...prevMessages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1].isLoading = false;
          updatedMessages[updatedMessages.length - 1].content = `任务查询异常`;
        }
        return updatedMessages;
      });
    }
  }

  // 按 Enter 发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getContent = (msg: Message) => {
    if (msg.role === 'assistant') {
      return msg.isLoading ? null : (msg.content.startsWith('/api/v1/jimeng/video/')) ? <video className='video' src={msg.content} controls></video> : msg.content
    }
    return msg.content
  }

  return (
    <div className="aichat-container">
      <div className="aichat-header">
        <h1>创意游戏视频助手</h1>
        <p>让您的创意形象化</p>
      </div>

      <div className="aichat-messages">
        {
          messages.map((msg) => (
            <Bubble
              key={msg.id}
              content={getContent(msg)}
              loading={msg.isLoading}
              loadingRender={() => <div>{msg.content === 'downloading' ? '下载中' : '生成中'}</div>}
              placement={msg.role === 'user' ? 'end' : 'start'}
              avatar={
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: msg.role === 'user' ? '#1890ff' : '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
              }
              style={{
                marginBottom: '12px',
              }}
            />
          ))
        }
        <div ref={messagesEndRef} />
      </div>

      <div className="aichat-input-area">
        <Space.Compact style={{ width: '100%' }}>
          <Input.TextArea
            rows={3}
            placeholder="输入你的问题或消息 (Shift+Enter 换行，Enter 发送)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            allowClear
          />
        </Space.Compact>
      </div>
    </div>
  );
}
