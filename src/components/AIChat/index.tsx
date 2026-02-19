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
  const setLoading = useStore((s) => s.setLoading);
  const loading = useStore((s) => s.loading);
  const [inputValue, setInputValue] = useState('');
  const [taskId, setTaskId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const newUserMessage: Message = {
        id: String(Date.now()),
        content: inputValue,
        role: 'user',
        timestamp: new Date(),
      };

      addMessage(newUserMessage);
      setInputValue('');
      setLoading(true);
      // const res = await videoAPI.submitJimeng3_0Pro1080P(newUserMessage.content);
      const res = await videoAPI.submitJimeng3_0_1080P(newUserMessage.content);
      console.log('res', res)
      let content = ''
      if (res.status === 50430) {
        content = '请求太快了，请稍后再试'
      } else if (res.status === 10000) {
        content = res.data?.task_id || ''
        setTaskId(content);
      }
      
      const newAIMessage: Message = {
        id: String(Date.now() + 1),
        content: content,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(newAIMessage);
    } catch (error) {
      console.error('发送消息失败:', error);
      // 添加错误提示消息
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        content: '消息发送失败，请检查网络连接后重试。',
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getResult = async () => {
    if (!taskId) return;
    try {
      // const res = await videoAPI.getJimeng3_0Pro1080PResult(taskId);
      const res = await videoAPI.getJimeng3_0_1080PResult(taskId);
      console.log('getResult:', res);
      // const newAIMessage: Message = {
      //   id: String(Date.now() + 1),
      //   content: await res.text(),
      //   role: "assistant",
      //   timestamp: new Date(),
      // };
      // addMessage(newAIMessage);
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
              content={msg.content}
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
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={loading}
          disabled={!inputValue.trim() || loading}
          style={{ marginTop: '12px', width: '100%' }}
        >
          {loading ? '发送中...' : '发送'}
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={getResult}
          style={{ marginTop: '12px', width: '100%' }}
        >
          获取结果
        </Button>
      </div>
    </div>
  );
}
