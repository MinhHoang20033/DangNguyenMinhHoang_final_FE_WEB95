import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getEmployees, getProjects } from "@/utils/api";
import { getProjectStatusPresentation, isProjectOverdue, stripLegacyProjectFields } from "@/features/project";

const { Title, Text } = Typography;
const PROJECT_PROGRESS_BATCH_SIZE = 5;
const PROJECT_MEMBER_BATCH_SIZE = 6;
const UNASSIGNED_MEMBER_BATCH_SIZE = 6;

const surfaceStyle = {
  borderRadius: 24,
  border: "1px solid #dbe4f0",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

const statCards = [
  {
    key: "activeProjects",
    title: "Dự án đang triển khai",
    color: "#2563eb",
    icon: <ProjectOutlined style={{ color: "#2563eb" }} />,
  },
  {
    key: "overdueProjects",
    title: "Dự án trễ hạn",
    color: "#dc2626",
    icon: <ClockCircleOutlined style={{ color: "#dc2626" }} />,
  },
  {
    key: "completedProjects",
    title: "Dự án đã hoàn thành",
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
    title: "Task chưa hoàn thành",
    color: "#ea580c",
    icon: <ClockCircleOutlined style={{ color: "#ea580c" }} />,
  },
];

const getProjectCreatedAt = (project) => {
  const objectIdPrefix = project?._id?.toString?.().slice(0, 8);
  if (!objectIdPrefix) return 0;

  return parseInt(objectIdPrefix, 16) * 1000;
};

const getTaskProgress = (project) => {
  const totalTasks = project.tasks?.length ?? 0;
  const completedTasks = (project.tasks ?? []).filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { totalTasks, completedTasks, pendingTasks, percent };
};

const getProgressStrokeColor = (project) => {
  const { tagColor } = getProjectStatusPresentation(project);
  if (tagColor === "red") return "#dc2626";
  if (tagColor === "default") return "#16a34a";
  return "#2563eb";
};

function StatCard({ title, value, color, icon, loading }) {
  return (
    <Card loading={loading} style={{ ...surfaceStyle, height: "100%" }} bodyStyle={{ padding: 22 }}>
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
        <Statistic value={value} valueStyle={{ color: "#0f172a", fontSize: 30, fontWeight: 700 }} />
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
      bodyStyle={{ padding: 22 }}
      headStyle={{ borderBottom: "1px solid #e2e8f0" }}
    >
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleProjectCount, setVisibleProjectCount] = useState(PROJECT_PROGRESS_BATCH_SIZE);
  const [visibleMemberProjectCount, setVisibleMemberProjectCount] = useState(PROJECT_MEMBER_BATCH_SIZE);
  const [visibleUnassignedMemberCount, setVisibleUnassignedMemberCount] = useState(UNASSIGNED_MEMBER_BATCH_SIZE);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectData, employeeData] = await Promise.all([
          getProjects(),
          getEmployees({ all: true }),
        ]);
        setProjects((projectData ?? []).map(stripLegacyProjectFields));
        setEmployees(employeeData ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dashboardData = useMemo(() => {
    const completedProjects = projects.filter((project) => project.status !== "active");
    const overdueProjects = projects.filter(
      (project) => project.status === "active" && isProjectOverdue(project),
    );
    const inProgressProjects = projects.filter(
      (project) => project.status === "active" && !isProjectOverdue(project),
    );
    const pendingTasks = projects.reduce(
      (sum, project) => sum + (project.tasks ?? []).filter((task) => !task.completed).length,
      0,
    );

    const recentProjects = [...projects]
      .sort((left, right) => getProjectCreatedAt(right) - getProjectCreatedAt(left))
      .slice(0, 5);

    const projectsByTasks = [...projects]
      .sort((left, right) => (right.tasks?.length ?? 0) - (left.tasks?.length ?? 0))
      .map((project) => ({
        ...project,
        progress: getTaskProgress(project),
      }));

    const projectsByMembers = [...projects].sort(
      (left, right) => (right.members?.length ?? 0) - (left.members?.length ?? 0),
    );

    const memberTaskMap = employees.reduce((accumulator, employee) => {
      accumulator[employee._id] = {
        employee,
        total: 0,
        projectNames: new Set(),
      };
      return accumulator;
    }, {});

    projects.forEach((project) => {
      (project.members ?? []).forEach((member) => {
        if (memberTaskMap[member.employeeId]) {
          memberTaskMap[member.employeeId].projectNames.add(
            project.name || "Dự án chưa đặt tên",
          );
        }
      });

      (project.tasks ?? []).forEach((task) => {
        (task.assigneeIds ?? []).forEach((employeeId) => {
          if (memberTaskMap[employeeId]) {
            memberTaskMap[employeeId].total += 1;
          }
        });
      });
    });

    const unassignedProjectMembers = Object.values(memberTaskMap)
      .filter((item) => item.projectNames.size > 0 && item.total === 0)
      .sort((left, right) =>
        (left.employee.name || "").localeCompare(right.employee.name || "", "vi"),
      )
      .slice(0, 6);

    return {
      inProgressProjects,
      overdueProjects,
      completedProjects,
      pendingTasks,
      recentProjects,
      projectsByTasks,
      projectsByMembers,
      unassignedProjectMembers,
    };
  }, [employees, projects]);

  useEffect(() => {
    setVisibleProjectCount(PROJECT_PROGRESS_BATCH_SIZE);
  }, [dashboardData.projectsByTasks.length]);

  useEffect(() => {
    setVisibleMemberProjectCount(PROJECT_MEMBER_BATCH_SIZE);
  }, [dashboardData.projectsByMembers.length]);

  useEffect(() => {
    setVisibleUnassignedMemberCount(UNASSIGNED_MEMBER_BATCH_SIZE);
  }, [dashboardData.unassignedProjectMembers.length]);

  const statValues = {
    activeProjects: dashboardData.inProgressProjects.length,
    overdueProjects: dashboardData.overdueProjects.length,
    completedProjects: dashboardData.completedProjects.length,
    employees: employees.length,
    pendingTasks: dashboardData.pendingTasks,
  };

  const visibleProjectsByTasks = dashboardData.projectsByTasks.slice(0, visibleProjectCount);
  const visibleProjectsByMembers = dashboardData.projectsByMembers.slice(0, visibleMemberProjectCount);
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

  const handleProjectMembersScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (!reachedBottom || visibleMemberProjectCount >= dashboardData.projectsByMembers.length) {
      return;
    }

    setVisibleMemberProjectCount((current) =>
      Math.min(current + PROJECT_MEMBER_BATCH_SIZE, dashboardData.projectsByMembers.length),
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

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card
        style={{
          ...surfaceStyle,
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 30%), linear-gradient(135deg, #f8fbff 0%, #eef6ff 45%, #f8fffc 100%)",
        }}
        bodyStyle={{ padding: 28 }}
      >
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
            Trung tâm điều hành dự án
          </Tag>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard tổng quan dự án và nhân sự
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Theo dõi nhanh tình trạng dự án, tiến độ task và những nhân sự đang tham gia.
          </Text>
        </Space>
      </Card>

      <Row gutter={[20, 20]}>
        {statCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8} xl={6}>
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
        <Col xs={24}>
          <SectionCard
            title="Tiến độ theo dự án"
            extra={<Text type="secondary">Toàn bộ dự án</Text>}
            loading={loading}
          >
            {dashboardData.projectsByTasks.length ? (
              <div
                style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}
                onScroll={handleProjectProgressScroll}
              >
                <Space direction="vertical" size={18} style={{ width: "100%" }}>
                  {visibleProjectsByTasks.map((project) => {
                    const statusPresentation = getProjectStatusPresentation(project);

                    return (
                      <div key={project._id}>
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
                        <Row justify="space-between">
                          <Text type="secondary">
                            Hoàn thành {project.progress.completedTasks}/{project.progress.totalTasks} task
                          </Text>
                        </Row>
                      </div>
                    );
                  })}
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
          <SectionCard title="Nhân sự đang tham gia dự án nhưng chưa được giao task" loading={loading}>
            {dashboardData.unassignedProjectMembers.length ? (
              <div
                style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}
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
                          <Space wrap>
                            <Text type="secondary">Đang tham gia dự án</Text>
                            <Text type="secondary">
                              {Array.from(projectNames).slice(0, 2).join(", ")}
                              {projectNames.size > 2 ? "..." : ""}
                            </Text>
                          </Space>
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

        <Col xs={24} xl={12}>
          <SectionCard title="Dự án có nhiều thành viên" loading={loading}>
            {dashboardData.projectsByMembers.length ? (
              <div
                style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}
                onScroll={handleProjectMembersScroll}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {visibleProjectsByMembers.map((project) => (
                    <Card
                      key={project._id}
                      size="small"
                      bordered={false}
                      style={{ borderRadius: 18, background: "#f8fafc" }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Text strong>{project.name || "Dự án chưa đặt tên"}</Text>
                          <div>
                            <Text type="secondary">
                              {(project.members?.length ?? 0)} thành viên tham gia
                            </Text>
                          </div>
                        </Col>
                        <Col>
                          <Tag color={getProjectStatusPresentation(project).tagColor}>
                            {getProjectStatusPresentation(project).label}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu thành viên dự án" />
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
                    style={{
                      height: "100%",
                      borderRadius: 20,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                    bodyStyle={{ padding: 18 }}
                  >
                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                      <Row justify="space-between" align="middle">
                        <Text strong>{project.name || "Dự án chưa đặt tên"}</Text>
                        <Tag color={statusPresentation.tagColor}>{statusPresentation.label}</Tag>
                      </Row>
                      <Text type="secondary">
                        {project.members?.length ?? 0} thành viên • {progress.totalTasks} task
                      </Text>
                      <Progress
                        percent={progress.percent}
                        strokeColor={getProgressStrokeColor(project)}
                        trailColor="#e5e7eb"
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
