import { PATHS } from "@/router/paths";
import { Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  return (
    <>
      <div>这是home的描述</div>
      <Button onClick={() => navigate(PATHS.AI_CHAT)}>去AI聊天</Button>
    </>
  );
}
