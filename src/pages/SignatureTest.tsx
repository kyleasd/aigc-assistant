import { Button, Card, Space, Typography, message } from "antd";
import React, { useState } from "react";
import { videoAPI } from "@/apis/index";


const { Title, Text } = Typography;

export default function SignatureTest() {
  const [signingResult, setSigningResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTestReq = async () => { 
    setIsLoading(true);
    try {
      const res = await videoAPI.submitJimeng3_0Pro1080P("跳舞的小女孩");
      // console.log("res", res);
      // message.success("测试成功");
      // doRequest();
    } catch (error) {
      message.error("测试失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={2}>即梦测试</Title>
        
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <Text>点击下面的按钮来测试不同的签名功能：</Text>
          
          <Space>
            <Button 
              type="default" 
              onClick={handleTestReq}
              loading={isLoading}
            >
              测试视频请求
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}