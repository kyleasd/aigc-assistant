import { RobotOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Bubble } from "@ant-design/x";
import { Button, Empty, Input, Space, Spin } from "antd";
import React, { useEffect, useRef } from "react";
import { Message, useStore } from "../../store/useStore";
import "./aichat.css";

export default function AIChat() {
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const setLoading = useStore((s) => s.setLoading);
  const loading = useStore((s) => s.loading);
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 模拟 AI 回复（实际应用中应替换为真实 API 调用）
  const simulateAIResponse = (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          `我已收到你的消息："${userMessage}"。这是一个演示回复。`,
          "这是一个很好的问题！我正在处理中...",
          "我理解了。让我提供一个有用的回复。",
          "感谢你的提问！我会尽力帮助你。",
          "这是一个有趣的询问。让我为你分析一下。",
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        resolve(randomResponse);
      }, 800);
    });
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: String(Date.now()),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    addMessage(newUserMessage);
    setInputValue("");
    setLoading(true);

    try {
      // 调用 AI 回复
      const aiResponse = await simulateAIResponse(inputValue);

      const newAIMessage: Message = {
        id: String(Date.now() + 1),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(newAIMessage);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  // 按 Enter 发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="aichat-container">
      <div className="aichat-header">
        <h1>🤖 AI 对话助手</h1>
        <p>与 AI 进行实时对话，获取帮助和信息</p>
      </div>

      <div className="aichat-messages">
        {messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          messages.map((msg) => (
            <Bubble
              key={msg.id}
              content={msg.content}
              placement={msg.role === "user" ? "end" : "start"}
              avatar={
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: msg.role === "user" ? "#1890ff" : "#52c41a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                </div>
              }
              style={{
                marginBottom: "12px",
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
        <Space.Compact style={{ width: "100%" }}>
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
          style={{ marginTop: "12px", width: "100%" }}
        >
          {loading ? "发送中..." : "发送"}
        </Button>
      </div>
    </div>
  );
}
