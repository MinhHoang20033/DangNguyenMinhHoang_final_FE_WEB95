import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Empty,
  Grid,
  Input,
  message,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EyeOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { deleteEmployee, getEmployees } from "@/utils/api";
import { AccountRoleTag } from "@/features/employee";

const { Title, Text } = Typography;
const PAGE_SIZE = 10;

const softCardStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
  padding: "14px 16px",
};

function EmployeeMobileCard({ employee, onView, onDelete }) {
  return (
    <div style={softCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Avatar size={48} src={employee.avatar || undefined} icon={<UserOutlined />}>
          {(employee.name || "N").trim().charAt(0).toUpperCase()}
        </Avatar>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Text strong style={{ display: "block", fontSize: 16, wordBreak: "break-word" }}>
            {employee.name || "Nhân viên"}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {employee.employeeCode || "----"}
            {employee.role ? ` · ${employee.role}` : ""}
          </Text>
          <div style={{ marginTop: 8 }}>
            <AccountRoleTag role={employee.accountRole} />
          </div>
        </div>
      </div>

      {employee.email ? (
        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: 13,
            marginBottom: 12,
            wordBreak: "break-all",
          }}
        >
          {employee.email}
        </Text>
      ) : null}

      <Space style={{ width: "100%" }} size="small">
        <Button
          block
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onView(employee._id)}
        >
          Chi tiết
        </Button>
        <Popconfirm title="Xóa nhân viên?" onConfirm={() => onDelete(employee._id)}>
          <Button block danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}

export default function Employees() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await getEmployees({
        page,
        limit: PAGE_SIZE,
        search: search.trim(),
      });
      setEmployees(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      setLoadError(error.message || "Không tải được danh sách nhân viên");
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchEmployees();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [fetchEmployees, search]);

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);

      if (employees.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchEmployees();
      }

      message.success("Đã xóa nhân viên");
    } catch (error) {
      message.error(error.message || "Không thể xóa nhân viên");
    }
  };

  const columns = [
    {
      title: "Ảnh",
      render: (_, record) => (
        <Avatar src={record.avatar || undefined}>
          {(record.name || "N").trim().charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: "ID",
      dataIndex: "employeeCode",
      width: 90,
      render: (value) => value || "----",
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Chức danh",
      dataIndex: "role",
      render: (value) => value || "—",
    },
    {
      title: "Kiểu tài khoản",
      dataIndex: "accountRole",
      render: (value) => <AccountRoleTag role={value} />,
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/employees/${record._id}`)}>
            Chi tiết
          </Button>

          <Popconfirm title="Xóa nhân viên?" onConfirm={() => handleDelete(record._id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div
        style={{
          ...softCardStyle,
          padding: isMobile ? 16 : 20,
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 40%), linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: "100%", justifyContent: "space-between" }}
          size="middle"
        >
          <div>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              Nhân viên
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {total} nhân sự trong hệ thống
            </Text>
          </div>

          <Button
            type="primary"
            block={isMobile}
            icon={<PlusOutlined />}
            onClick={() => navigate("/employees/add")}
          >
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Input.Search
        placeholder="Tìm theo tên, mã NV hoặc chức danh..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        allowClear
        size={isMobile ? "large" : "middle"}
      />

      {loadError ? (
        <Empty description={loadError} style={{ marginTop: 24 }} />
      ) : isMobile ? (
        <Spin spinning={loading}>
          {employees.length ? (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {employees.map((employee) => (
                <EmployeeMobileCard
                  key={employee._id}
                  employee={employee}
                  onView={(id) => navigate(`/employees/${id}`)}
                  onDelete={handleDelete}
                />
              ))}

              {total > PAGE_SIZE ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                  <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onChange={setPage}
                    size="small"
                    showSizeChanger={false}
                  />
                </div>
              ) : null}
            </Space>
          ) : (
            <Empty description={loading ? "Đang tải..." : "Không có nhân viên"} />
          )}
        </Spin>
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={employees}
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (nextPage) => setPage(nextPage),
          }}
          scroll={{ x: 900 }}
          locale={{ emptyText: loading ? "Đang tải..." : "Không có nhân viên" }}
        />
      )}
    </Space>
  );
}
