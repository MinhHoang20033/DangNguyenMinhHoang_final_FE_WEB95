import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Empty, Input, message, Popconfirm, Space, Table, Typography } from "antd";
import { deleteEmployee, getEmployees } from "@/utils/api";
import { AccountRoleTag } from "@/features/employee";

const { Title } = Typography;
const PAGE_SIZE = 10;

export default function Employees() {
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

          <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record._id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={3}>Nhân viên</Title>

        <Button type="primary" onClick={() => navigate("/employees/add")}>
          Thêm nhân viên
        </Button>
      </Space>

      <Input
        placeholder="Tìm kiếm theo tên, mã NV hoặc chức danh..."
        style={{ maxWidth: 320, marginBottom: 20 }}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        allowClear
      />

      {loadError ? (
        <Empty description={loadError} style={{ marginTop: 40 }} />
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
    </div>
  );
}
