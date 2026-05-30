import { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Grid,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { addProject, deleteProject, getProjects } from "@/utils/api";
import { AuthContext } from "@/context/AuthContextValue";
import {
  getProjectStatusPresentation,
  isProjectOverdue,
  stripLegacyProjectFields,
} from "@/features/project";

const { Title, Text } = Typography;

const getProjectCreatedAt = (project) => {
  const objectIdPrefix = project?._id?.toString?.().slice(0, 8);
  if (!objectIdPrefix) return 0;

  return parseInt(objectIdPrefix, 16) * 1000;
};

const getProjectTaskProgress = (project) => {
  const totalTasks = project.tasks?.length ?? 0;
  const completedTasks = (project.tasks ?? []).filter((task) => task.completed).length;

  return { completedTasks, totalTasks };
};

const ACTIVE_PROJECT_BANNERS = [
  {
    background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    boxShadow: "0 10px 24px rgba(20, 184, 166, 0.24)",
  },
  {
    background: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.24)",
  },
  {
    background: "linear-gradient(135deg, #be123c 0%, #fb7185 100%)",
    boxShadow: "0 10px 24px rgba(244, 63, 94, 0.24)",
  },
  {
    background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    boxShadow: "0 10px 24px rgba(139, 92, 246, 0.24)",
  },
  {
    background: "linear-gradient(135deg, #c2410c 0%, #fb923c 100%)",
    boxShadow: "0 10px 24px rgba(249, 115, 22, 0.24)",
  },
];

const getDeadlineDayjs = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const getProjectBannerStyle = (project) => {
  if (project.status !== "active") {
    return {
      background: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)",
      boxShadow: "0 10px 24px rgba(148, 163, 184, 0.24)",
    };
  }

  if (isProjectOverdue(project)) {
    return {
      background: "linear-gradient(135deg, #991b1b 0%, #f87171 100%)",
      boxShadow: "0 10px 24px rgba(248, 113, 113, 0.28)",
    };
  }

  const projectId = project._id?.toString?.() ?? project.name ?? "";
  const hash = [...projectId].reduce((total, char) => total + char.charCodeAt(0), 0);
  return ACTIVE_PROJECT_BANNERS[hash % ACTIVE_PROJECT_BANNERS.length];
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectListView, setProjectListView] = useState("all");

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const screens = Grid.useBreakpoint();
  const isAdmin = user?.role === "admin";
  const isMobile = !screens.md;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data.map(stripLegacyProjectFields));
    } catch (err) {
      console.error("Fetch projects failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const created = await addProject({
        name: name.trim(),
        deadline: deadline ? deadline.format("YYYY-MM-DD") : "",
      });
      setProjects((prev) => [stripLegacyProjectFields(created), ...prev]);
      setName("");
      setDeadline(null);
      setOpen(false);
      message.success("Đã tạo dự án");
    } catch (err) {
      message.error(err.message || "Tạo dự án thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((project) => project._id !== id));
  };

  const filtered = [...projects]
    .filter((project) => project.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getProjectCreatedAt(b) - getProjectCreatedAt(a));

  const activeProjects = filtered.filter((project) => project.status === "active");
  const completedProjects = filtered.filter((project) => project.status !== "active");
  const overdueProjects = activeProjects.filter((project) => isProjectOverdue(project));
  const inProgressProjects = activeProjects.filter((project) => !isProjectOverdue(project));

  const visibleProjects =
    projectListView === "all"
      ? filtered
      : projectListView === "completed"
        ? completedProjects
        : projectListView === "overdue"
          ? overdueProjects
          : inProgressProjects;

  const emptyDescription = (() => {
    if (loading) return "Đang tải dự án...";
    if (projectListView === "all") return "Không có dự án";
    if (projectListView === "completed") return "Không có dự án hoàn thành";
    if (projectListView === "overdue") return "Không có dự án trễ hạn";
    return "Không có dự án đang triển khai";
  })();

  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        Dự án
      </Title>

      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        size={12}
        style={{ marginBottom: 20, width: "100%" }}
      >
        <Input
          placeholder="Tìm kiếm dự án..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ width: isMobile ? "100%" : 260 }}
        />

        <Space
          wrap
          size={12}
          style={{ width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-start" }}
        >
          <Button
            type={projectListView === "all" ? "primary" : "default"}
            onClick={() => setProjectListView("all")}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Hiện tất cả dự án
          </Button>

          <Button
            type={projectListView === "active" ? "primary" : "default"}
            onClick={() => setProjectListView("active")}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Hiện dự án đang triển khai
          </Button>

          <Button
            type={projectListView === "overdue" ? "primary" : "default"}
            onClick={() => setProjectListView("overdue")}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Hiện dự án trễ hạn
          </Button>

          <Button
            type={projectListView === "completed" ? "primary" : "default"}
            onClick={() => setProjectListView("completed")}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Hiện dự án hoàn thành
          </Button>

          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              Thêm dự án
            </Button>
          )}
        </Space>
      </Space>

      {visibleProjects.length ? (
        <Row gutter={[20, 20]}>
          {visibleProjects.map((project) => {
            const { completedTasks, totalTasks } = getProjectTaskProgress(project);
            const { bannerLabel, label: statusTag, tagColor } = getProjectStatusPresentation(project);
            const deadlineLabel = getDeadlineDayjs(project.deadline);

            return (
              <Col key={project._id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  loading={loading}
                  style={{
                    height: "100%",
                    overflow: "hidden",
                    width: "100%",
                    borderRadius: 20,
                  }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 200,
                    padding: isMobile ? 16 : 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        ...getProjectBannerStyle(project),
                        marginBottom: 16,
                        marginTop: isMobile ? -16 : -24,
                        marginLeft: isMobile ? -16 : -24,
                        marginRight: isMobile ? -16 : -24,
                        padding: isMobile ? "12px 16px 16px" : "14px 18px 18px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                        }}
                      >
                        {bannerLabel}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Title level={4} style={{ margin: 0, fontSize: isMobile ? 18 : undefined }}>
                        {project.name}
                      </Title>

                      {isAdmin && (
                        <Popconfirm
                          title="Xóa dự án?"
                          onPopupClick={(event) => event.stopPropagation()}
                          onConfirm={() => handleDelete(project._id)}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </Popconfirm>
                      )}
                    </div>

                    <Space size={[8, 8]} wrap>
                      <Tag color={tagColor}>{statusTag}</Tag>
                    </Space>
                    <div style={{ marginTop: 10 }}>
                      <Text type="secondary">
                        Hạn dự án:{" "}
                        {deadlineLabel ? deadlineLabel.format("DD/MM/YYYY") : "Chưa đặt"}
                      </Text>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">{project.members?.length ?? 0} thành viên</Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        Tiến độ task: {completedTasks}/{totalTasks}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description={emptyDescription} style={{ marginTop: 40 }} />
      )}

      {isAdmin && (
        <Modal
          open={open}
          onCancel={() => {
            setOpen(false);
            setDeadline(null);
          }}
          onOk={handleAdd}
          confirmLoading={creating}
          title="Thêm dự án"
          okText="Tạo dự án"
          cancelText="Hủy"
          width={isMobile ? "calc(100vw - 24px)" : 520}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Input
              placeholder="Tên dự án"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <div>
              <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                Hạn dự án
              </Text>
              <DatePicker
                style={{ width: "100%" }}
                value={deadline}
                onChange={setDeadline}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày (tuỳ chọn)"
                allowClear
              />
            </div>
          </Space>
        </Modal>
      )}
    </div>
  );
}
