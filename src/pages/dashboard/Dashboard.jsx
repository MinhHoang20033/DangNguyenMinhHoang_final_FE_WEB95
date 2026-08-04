import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Grid,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  ShopOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { AuthContext } from "@/context/AuthContextValue";
import { getProjectStatusPresentation } from "@/features/project";
import { getEmployees, getPartners, getProjects } from "@/utils/api";
import {
  ROLE_LABELS,
  computeDashboardData,
  getGreeting,
  getDeadlineDayjs,
  getProgressStrokeColor,
  getTaskProgress,
} from "./dashboardHelpers.js";

const { Title, Text } = Typography;

const PROJECT_PROGRESS_BATCH_SIZE = 5;
const UNASSIGNED_MEMBER_BATCH_SIZE = 6;
const LIST_SCROLL_STYLE = {
  maxHeight: 360,
  overflowY: "auto",
  paddingRight: 8,
};

const surfaceStyle = {
  borderRadius: 24,
  border: "1px solid #dbe4f0",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

const interactiveRowStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  padding: "12px 14px",
  background: "#fff",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
};

const interactiveRowHoverHandlers = {
  onMouseEnter: (event) => {
    event.currentTarget.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.08)";
    event.currentTarget.style.transform = "translateY(-1px)";
  },
  onMouseLeave: (event) => {
    event.currentTarget.style.boxShadow = "none";
    event.currentTarget.style.transform = "none";
  },
};

const statCards = [
  {
    key: "totalProjects",
    title: "Tổng dự án",
    color: "#0f766e",
    icon: <ProjectOutlined style={{ color: "#0f766e" }} />,
  },
  {
    key: "activeProjects",
    title: "Đang triển khai",
    color: "#2563eb",
    icon: <ProjectOutlined style={{ color: "#2563eb" }} />,
  },
  {
    key: "overdueProjects",
    title: "Trễ hạn",
    color: "#dc2626",
    icon: <WarningOutlined style={{ color: "#dc2626" }} />,
  },
  {
    key: "completedProjects",
    title: "Đã hoàn thành",
    color: "#16a34a",
    icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
  },
  {
    key: "employees",
    title: "Nhân sự",
    color: "#7c3aed",
    icon: <TeamOutlined style={{ color: "#7c3aed" }} />,
  },
  {
    key: "pendingTasks",
    title: "Task chưa xong",
    color: "#ea580c",
    icon: <ClockCircleOutlined style={{ color: "#ea580c" }} />,
  },
];

function StatCard({ title, value, suffix, color, icon, loading }) {
  return (
    <Card loading={loading} style={{ ...surfaceStyle, height: "100%" }} styles={{ body: { padding: 22 } }}>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Space size={12}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${color}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {icon}
          </div>
          <Text type="secondary">{title}</Text>
        </Space>
        <Statistic
          value={value}
          suffix={suffix}
          valueStyle={{ color: "#0f172a", fontSize: 30, fontWeight: 700 }}
        />
      </Space>
    </Card>
  );
}

function SectionCard({ title, extra, children, loading }) {
  return (
    <Card
      title={title}
      extra={extra}
      loading={loading}
      style={{ ...surfaceStyle, height: "100%" }}
      styles={{
        body: { padding: 22 },
        header: { borderBottom: "1px solid #e2e8f0" },
      }}
    >
      {children}
    </Card>
  );
}

function StatusDistribution({ statusCounts, totalProjects }) {
  if (!totalProjects) {
    return <Empty description="Chưa có dự án" />;
  }

  const segments = [
    { key: "inProgress", label: "Đang triển khai", value: statusCounts.inProgress, color: "#2563eb" },
    { key: "overdue", label: "Trễ hạn", value: statusCounts.overdue, color: "#dc2626" },
    { key: "completed", label: "Hoàn thành", value: statusCounts.completed, color: "#16a34a" },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          background: "#e5e7eb",
        }}
      >
        {segments.map((segment) =>
          segment.value > 0 ? (
            <div
              key={segment.key}
              title={`${segment.label}: ${segment.value}`}
              style={{
                width: `${(segment.value / totalProjects) * 100}%`,
                background: segment.color,
                minWidth: segment.value > 0 ? 8 : 0,
              }}
            />
          ) : null,
        )}
      </div>

      <Row gutter={[12, 12]}>
        {segments.map((segment) => (
          <Col key={segment.key} xs={24} sm={8}>
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: "12px 14px",
                background: "#f8fafc",
              }}
            >
              <Space align="center">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: segment.color,
                    display: "inline-block",
                  }}
                />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {segment.label}
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {segment.value}
                    </Text>
                    <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                      ({totalProjects ? Math.round((segment.value / totalProjects) * 100) : 0}%)
                    </Text>
                  </div>
                </div>
              </Space>
            </div>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

function DeadlineLinkRow({ item, navigate }) {
  const deadline = getDeadlineDayjs(item.deadline);
  const typeTag =
    item.type === "project" ? (
      <Tag color="blue">Dự án</Tag>
    ) : (
      <Tag color="purple">Task</Tag>
    );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${item.projectId}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/projects/${item.projectId}`);
        }
      }}
      style={interactiveRowStyle}
      {...interactiveRowHoverHandlers}
    >
      <Row justify="space-between" align="middle" wrap={false} gutter={12}>
        <Col flex="auto" style={{ minWidth: 0 }}>
          <Text strong ellipsis style={{ display: "block" }}>
            {item.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.subtitle}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            Còn {item.daysLeft} ngày · {deadline ? deadline.format("DD/MM/YYYY") : "Chưa có"}
          </Text>
        </Col>
        <Col>{typeTag}</Col>
      </Row>
    </div>
  );
}

function ProjectLinkRow({ project, navigate, extra }) {
  const statusPresentation = getProjectStatusPresentation(project);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${project._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/projects/${project._id}`);
        }
      }}
      style={interactiveRowStyle}
      {...interactiveRowHoverHandlers}
    >
      <Row justify="space-between" align="middle" wrap={false} gutter={12}>
        <Col flex="auto" style={{ minWidth: 0 }}>
          <Text strong ellipsis style={{ display: "block" }}>
            {project.name || "Dự án chưa đặt tên"}
          </Text>
          {extra}
        </Col>
        <Col>
          <Tag color={statusPresentation.tagColor}>{statusPresentation.label}</Tag>
        </Col>
      </Row>
    </div>
  );
}

function ProjectProgressRow({ project, navigate }) {
  const statusPresentation = getProjectStatusPresentation(project);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${project._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/projects/${project._id}`);
        }
      }}
      style={interactiveRowStyle}
      {...interactiveRowHoverHandlers}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
        <Col>
          <Text strong>{project.name || "Dự án chưa đặt tên"}</Text>
        </Col>
        <Col>
          <Tag color={statusPresentation.tagColor}>{statusPresentation.label}</Tag>
        </Col>
      </Row>
      <Progress
        percent={project.progress.percent}
        strokeColor={getProgressStrokeColor(project)}
        trailColor="#e5e7eb"
      />
      <Text type="secondary">
        Hoàn thành {project.progress.completedTasks}/{project.progress.totalTasks} task
      </Text>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [partnerTotal, setPartnerTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visibleProjectCount, setVisibleProjectCount] = useState(PROJECT_PROGRESS_BATCH_SIZE);
  const [visibleUnassignedMemberCount, setVisibleUnassignedMemberCount] = useState(
    UNASSIGNED_MEMBER_BATCH_SIZE,
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectData, employeeData, partnerData] = await Promise.all([
          getProjects(),
          getEmployees({ all: true }),
          getPartners({ limit: 1 }).catch(() => ({ total: 0 })),
        ]);
        setProjects(projectData ?? []);
        setEmployees(employeeData ?? []);
        setPartnerTotal(partnerData?.total ?? 0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dashboardData = useMemo(
    () => computeDashboardData(projects, employees),
    [employees, projects],
  );

  useEffect(() => {
    setVisibleProjectCount(PROJECT_PROGRESS_BATCH_SIZE);
  }, [dashboardData.projectsByTasks.length]);

  useEffect(() => {
    setVisibleUnassignedMemberCount(UNASSIGNED_MEMBER_BATCH_SIZE);
  }, [dashboardData.unassignedProjectMembers.length]);

  const statValues = {
    totalProjects: dashboardData.totalProjects,
    activeProjects: dashboardData.inProgressProjects.length,
    overdueProjects: dashboardData.overdueProjects.length,
    completedProjects: dashboardData.completedProjects.length,
    employees: employees.length,
    pendingTasks: dashboardData.pendingTasks,
  };

  const visibleProjectsByTasks = dashboardData.projectsByTasks.slice(0, visibleProjectCount);
  const visibleUnassignedMembers = dashboardData.unassignedProjectMembers.slice(
    0,
    visibleUnassignedMemberCount,
  );

  const handleProjectProgressScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (!reachedBottom || visibleProjectCount >= dashboardData.projectsByTasks.length) {
      return;
    }

    setVisibleProjectCount((current) =>
      Math.min(current + PROJECT_PROGRESS_BATCH_SIZE, dashboardData.projectsByTasks.length),
    );
  };

  const handleUnassignedMembersScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (!reachedBottom || visibleUnassignedMemberCount >= dashboardData.unassignedProjectMembers.length) {
      return;
    }

    setVisibleUnassignedMemberCount((current) =>
      Math.min(current + UNASSIGNED_MEMBER_BATCH_SIZE, dashboardData.unassignedProjectMembers.length),
    );
  };

  const displayName = user?.username || "Admin";
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Quản trị";

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card
        style={{
          ...surfaceStyle,
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 30%), linear-gradient(135deg, #f8fbff 0%, #eef6ff 45%, #f8fffc 100%)",
        }}
        styles={{ body: { padding: isMobile ? 20 : 28 } }}
      >
        <Row gutter={[20, 20]} align="middle" justify="space-between">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={8}>
              <Tag
                color="blue"
                style={{
                  width: "fit-content",
                  borderRadius: 999,
                  paddingInline: 12,
                  paddingBlock: 4,
                  fontSize: 13,
                }}
              >
                {roleLabel}
              </Tag>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                {getGreeting()}, {displayName}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Tổng quan hệ thống ngày {dayjs().format("DD/MM/YYYY")} — {dashboardData.totalProjects}{" "}
                dự án, {dashboardData.totalTasks} task, {partnerTotal} đối tác.
              </Text>
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <Space wrap style={{ width: "100%", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
              <Button type="primary" icon={<ProjectOutlined />} onClick={() => navigate("/projects")}>
                Quản lý dự án
              </Button>
              <Button icon={<TeamOutlined />} onClick={() => navigate("/employees")}>
                Nhân sự
              </Button>
              <Button icon={<ShopOutlined />} onClick={() => navigate("/partners")}>
                Đối tác
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        {statCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8} xl={4}>
            <StatCard
              title={item.title}
              value={statValues[item.key]}
              color={item.color}
              icon={item.icon}
              loading={loading}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}>
          <SectionCard title="Phân bổ trạng thái dự án" loading={loading}>
            <StatusDistribution
              statusCounts={dashboardData.statusCounts}
              totalProjects={dashboardData.totalProjects}
            />
          </SectionCard>
        </Col>

        <Col xs={24} xl={10}>
          <SectionCard title="Tiến độ task toàn hệ thống" loading={loading}>
            <Row gutter={[20, 20]} align="middle">
              <Col xs={24} sm={12} style={{ textAlign: "center" }}>
                <Progress
                  type="dashboard"
                  percent={dashboardData.taskCompletionRate}
                  strokeColor={{
                    "0%": "#2563eb",
                    "100%": "#16a34a",
                  }}
                  size={isMobile ? 140 : 168}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      borderRadius: 16,
                      padding: "12px 14px",
                      background: "#eff6ff",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <Text type="secondary">Đã hoàn thành</Text>
                    <div>
                      <Text strong style={{ fontSize: 22, color: "#16a34a" }}>
                        {dashboardData.completedTasks}
                      </Text>
                      <Text type="secondary"> / {dashboardData.totalTasks} task</Text>
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: 16,
                      padding: "12px 14px",
                      background: "#fff7ed",
                      border: "1px solid #ffedd5",
                    }}
                  >
                    <Text type="secondary">Chưa hoàn thành</Text>
                    <div>
                      <Text strong style={{ fontSize: 22, color: "#ea580c" }}>
                        {dashboardData.pendingTasks}
                      </Text>
                      <Text type="secondary"> task đang chờ</Text>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </SectionCard>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <SectionCard
            title="Dự án trễ hạn"
            extra={
              dashboardData.overdueProjects.length ? (
                <Tag color="red">{dashboardData.overdueProjects.length}</Tag>
              ) : null
            }
            loading={loading}
          >
            {dashboardData.overdueProjects.length ? (
              <div style={LIST_SCROLL_STYLE}>
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  {dashboardData.overdueProjects.map((project) => {
                    const deadline = getDeadlineDayjs(project.deadline);
                    return (
                      <ProjectLinkRow
                        key={project._id}
                        project={project}
                        navigate={navigate}
                        extra={
                          <Text type="danger" style={{ fontSize: 12 }}>
                            Deadline: {deadline ? deadline.format("DD/MM/YYYY") : "Chưa có"}
                          </Text>
                        }
                      />
                    );
                  })}
                </Space>
              </div>
            ) : (
              <Alert
                type="success"
                showIcon
                message="Không có dự án trễ hạn"
                description="Tất cả dự án đang triển khai đều trong thời hạn."
              />
            )}
          </SectionCard>
        </Col>

        <Col xs={24} lg={12}>
          <SectionCard
            title="Deadline trong 7 ngày tới"
            extra={
              dashboardData.upcomingDeadlines.length ? (
                <Tag color="orange">{dashboardData.upcomingDeadlines.length}</Tag>
              ) : null
            }
            loading={loading}
          >
            {dashboardData.upcomingDeadlines.length ? (
              <div style={LIST_SCROLL_STYLE}>
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  {dashboardData.upcomingDeadlines.map((item) => (
                    <DeadlineLinkRow key={item.key} item={item} navigate={navigate} />
                  ))}
                </Space>
              </div>
            ) : (
              <Alert
                type="info"
                showIcon
                message="Không có deadline sắp tới"
                description="Không có dự án hoặc task nào đến hạn trong 7 ngày tới."
              />
            )}
          </SectionCard>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <SectionCard
            title="Tiến độ theo dự án"
            extra={
              <Link to="/projects">
                <Button type="link" size="small" icon={<ArrowRightOutlined />}>
                  Xem tất cả
                </Button>
              </Link>
            }
            loading={loading}
          >
            {dashboardData.projectsByTasks.length ? (
              <div
                style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}
                onScroll={handleProjectProgressScroll}
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {visibleProjectsByTasks.map((project) => (
                    <ProjectProgressRow key={project._id} project={project} navigate={navigate} />
                  ))}
                </Space>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu dự án" />
            )}
          </SectionCard>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}>
          <SectionCard title="Nhân sự có nhiều task đang chờ" loading={loading}>
            {dashboardData.topEmployeesByTasks.length ? (
              <div style={LIST_SCROLL_STYLE}>
                <List
                  itemLayout="horizontal"
                  dataSource={dashboardData.topEmployeesByTasks}
                  renderItem={({ employee, total, pending }) => (
                    <List.Item
                      extra={
                        <Space direction="vertical" size={0} style={{ textAlign: "right" }}>
                          <Tag color="orange">{pending} chưa xong</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {total} task tổng
                          </Text>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar src={employee.avatar || undefined}>
                            {(employee.name || "N").trim().charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={employee.name || "Nhân viên"}
                        description={employee.role || employee.employeeCode || "----"}
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty description="Chưa có nhân sự đang có task chưa hoàn thành" />
            )}
          </SectionCard>
        </Col>

        <Col xs={24} xl={12}>
          <SectionCard title="Nhân sự trong dự án nhưng chưa có task" loading={loading}>
            {dashboardData.unassignedProjectMembers.length ? (
              <div
                style={LIST_SCROLL_STYLE}
                onScroll={handleUnassignedMembersScroll}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={visibleUnassignedMembers}
                  renderItem={({ employee, projectNames }) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src={employee.avatar || undefined}>
                            {(employee.name || "N").trim().charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={employee.name || "Nhân viên"}
                        description={
                          <Text type="secondary">
                            {Array.from(projectNames).slice(0, 2).join(", ")}
                            {projectNames.size > 2 ? "..." : ""}
                          </Text>
                        }
                      />
                      <Tag color="orange">Chưa có task</Tag>
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty description="Không có nhân sự nào đang ở dự án mà chưa được giao task" />
            )}
          </SectionCard>
        </Col>
      </Row>

      <SectionCard title="Dự án mới tạo gần đây" loading={loading}>
        {dashboardData.recentProjects.length ? (
          <Row gutter={[16, 16]}>
            {dashboardData.recentProjects.map((project) => {
              const progress = getTaskProgress(project);
              const statusPresentation = getProjectStatusPresentation(project);

              return (
                <Col key={project._id} xs={24} md={12} xl={8}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => navigate(`/projects/${project._id}`)}
                    style={{
                      height: "100%",
                      borderRadius: 18,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Row justify="space-between" align="middle">
                        <Text strong>{project.name || "Dự án chưa đặt tên"}</Text>
                        <Tag color={statusPresentation.tagColor}>{statusPresentation.label}</Tag>
                      </Row>
                      <Text type="secondary">
                        {project.members?.length ?? 0} thành viên · {progress.totalTasks} task
                      </Text>
                      <Progress
                        percent={progress.percent}
                        strokeColor={getProgressStrokeColor(project)}
                        trailColor="#e5e7eb"
                        size="small"
                      />
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty description="Chưa có dự án gần đây" />
        )}
      </SectionCard>
    </Space>
  );
}
