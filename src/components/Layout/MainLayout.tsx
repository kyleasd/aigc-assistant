import { MENU_ITEMS } from "@/router/paths";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export interface MainLayoutProps {
  children?: React.ReactNode;
  siderWidth?: number;
  collapsed?: boolean;
  menuItems?: MenuProps["items"];
}

const defaultMenuItems: MenuProps["items"] = MENU_ITEMS;

export default function MainLayout({
  children,
  siderWidth = 240,
  collapsed = false,
  menuItems = defaultMenuItems,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // use the pathname as the selected key; fallback to '/' when empty
  const selectedKey = location.pathname || "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={siderWidth} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={(info) => {
            const path = String(info.key || "");
            if (path && path !== location.pathname) navigate(path);
          }}
        />
      </Sider>
      <Layout>
        <Content>{children ?? <Outlet />}</Content>
      </Layout>
    </Layout>
  );
}
