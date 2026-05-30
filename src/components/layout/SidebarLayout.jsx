import { useContext, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, FloatButton, Grid, Layout, Menu, Typography } from "antd";
import {
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  ShopOutlined,
  ProjectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { AuthContext } from "@/context/AuthContextValue";

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

export default function SidebarLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isAdmin = user?.role === "admin";
  const isMobile = !screens.lg;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isProjectDetailPage =
    location.pathname.startsWith("/projects/") && location.pathname !== "/projects";

  const menuItems = useMemo(() => {
    const items = [];

    if (isAdmin) {
      items.push({
        key: "/dashboard",
        icon: <AppstoreOutlined />,
        label: <Link to="/dashboard">Tổng quan</Link>,
      });
    }

    items.push({
      key: "/projects",
      icon: <ProjectOutlined />,
      label: <Link to="/projects">Dự án</Link>,
    });

    if (isAdmin) {
      items.push({
        key: "/employees",
        icon: <TeamOutlined />,
        label: <Link to="/employees">Nhân viên</Link>,
      });
      items.push({
        key: "/partners",
        icon: <ShopOutlined />,
        label: <Link to="/partners">Đối tác</Link>,
      });
    }

    return items;
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        trigger={null}
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={isMobile ? !mobileSidebarOpen : false}
        onBreakpoint={(broken) => {
          if (!broken) {
            setMobileSidebarOpen(false);
          }
        }}
        style={{
          position: isMobile ? "fixed" : "sticky",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1100 : "auto",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
            />
          </div>

          <div style={{ padding: 20, flexShrink: 0 }}>
            <Button icon={<LogoutOutlined />} danger block onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </Sider>

      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.35)",
            zIndex: 1090,
          }}
        />
      )}

      <Layout style={{ minHeight: "100vh" }}>
        {isMobile && (
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              paddingInline: 16,
              paddingTop: "max(env(safe-area-inset-top), 8px)",
              height: "calc(64px + env(safe-area-inset-top))",
              lineHeight: "normal",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                minHeight: 64,
              }}
            >
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setMobileSidebarOpen(true)}
              />
              <Title
                level={5}
                style={{
                  margin: 0,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {isAdmin ? "Quản lý dự án" : "Dự án của tôi"}
              </Title>
            </div>
          </Header>
        )}

        <Content style={{ padding: isMobile ? 16 : 20 }}>
          <Outlet />
        </Content>
      </Layout>

      <FloatButton.BackTop
        visibilityHeight={240}
        style={{
          insetInlineEnd: 20,
          insetBlockEnd: isProjectDetailPage
            ? isMobile
              ? 148
              : 136
            : isMobile
              ? 84
              : 24,
        }}
      />
    </Layout>
  );
}
