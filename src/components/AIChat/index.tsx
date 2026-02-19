import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Button, Empty, Input, Space, Spin } from 'antd';
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
      let content = ''
      if (res.status === 50430) {
        content = '请求太快了，请稍后再试'
      } else if (res.status === 10000) {
        content = res.data?.task_id || ''
        setTaskId(content);
        // 直接更新 taskIdRef，确保立即反映最新值
        taskIdRef.current = content;
      }

      const newAIMessage: Message = {
        id: String(Date.now() + 1),
        content: '',
        role: "assistant",
        isLoading: true,
        timestamp: new Date(),
      };

      addMessage(newAIMessage);

      // 清除之前可能存在的定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        getResult();
      }, 2000);
    } catch (error) {
      console.error('handleSendMessage: ', error);
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
        messages[messages.length -1].isLoading = false
        messages[messages.length -1].content = res.data?.video_url || ''
        setMessages(messages)
        console.log('messages', messages)

        // 当任务完成时清除定时器
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (error) {
      console.error('getResult:', error);
    }
  }

  // 按 Enter 发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="aichat-container">
      <div className="aichat-header">
        <h1>创意游戏视频助手</h1>
        <p>让您的创意形象化</p>
      </div>

      <div className="aichat-messages">
        {messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          messages.map((msg) => (
            <Bubble
              key={msg.id}
              content={msg.role === 'assistant' ? (
                msg.isLoading ? null : <video src={msg.content} controls></video>
              ) : msg.content}
              loading={msg.isLoading}
              loadingRender={() => <div>生成中</div>}
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
        )}
        {loading && (
          <div className="aichat-loading">
            <Spin size="small" />
            <span>AI 正在思考中...</span>
          </div>
        )}
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
