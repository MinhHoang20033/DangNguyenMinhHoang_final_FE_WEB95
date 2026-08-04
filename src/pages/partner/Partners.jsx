import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from "antd";
import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { addPartner, deletePartner, getPartners, updatePartner } from "@/utils/api";

const { Title, Text } = Typography;
const PAGE_SIZE = 10;

const softCardStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
  padding: "14px 16px",
};

const createInitialEditorState = () => ({
  open: false,
  partnerId: null,
});

function PartnerInfoRow({ icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ color: "#64748b", marginTop: 2 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
          {label}
        </Text>
        <Text style={{ wordBreak: "break-word" }}>{value}</Text>
      </div>
    </div>
  );
}

function PartnerMobileCard({ partner, onEdit, onDelete }) {
  return (
    <div style={softCardStyle}>
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: "block", fontSize: 16, wordBreak: "break-word" }}>
          {partner.name || "Đối tác"}
        </Text>
        {partner.company ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {partner.company}
          </Text>
        ) : null}
      </div>

      <Space direction="vertical" size={10} style={{ width: "100%", marginBottom: 14 }}>
        <PartnerInfoRow icon={<MailOutlined />} label="Email" value={partner.email} />
        <PartnerInfoRow icon={<PhoneOutlined />} label="Số điện thoại" value={partner.phone} />
        {!partner.email && !partner.phone ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Chưa có thông tin liên hệ
          </Text>
        ) : null}
      </Space>

      <Space style={{ width: "100%" }} size="small">
        <Button block icon={<EditOutlined />} onClick={() => onEdit(partner)}>
          Sửa
        </Button>
        <Popconfirm
          title="Xóa đối tác?"
          description="Bạn có chắc chắn muốn xóa đối tác này không?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => onDelete(partner._id)}
        >
          <Button block danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}

export default function Partners() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editor, setEditor] = useState(createInitialEditorState());
  const [form] = Form.useForm();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await getPartners({
        page,
        limit: PAGE_SIZE,
        search: search.trim(),
      });
      setPartners(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      setLoadError(error.message || "Không thể tải danh sách đối tác");
      setPartners([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPartners();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [fetchPartners, search]);

  const openCreateModal = () => {
    setEditor({
      open: true,
      partnerId: null,
    });
    form.setFieldsValue({
      name: "",
      company: "",
      email: "",
      phone: "",
    });
  };

  const openEditModal = (partner) => {
    setEditor({
      open: true,
      partnerId: partner._id,
    });
    form.setFieldsValue({
      name: partner.name || "",
      company: partner.company || "",
      email: partner.email || "",
      phone: partner.phone || "",
    });
  };

  const closeModal = () => {
    setEditor(createInitialEditorState());
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const isCreate = !editor.partnerId;

      if (isCreate) {
        await addPartner(values);
        message.success("Đã thêm đối tác");
      } else {
        await updatePartner(editor.partnerId, values);
        message.success("Đã cập nhật thông tin đối tác");
      }

      closeModal();

      if (isCreate && page !== 1) {
        setPage(1);
      } else {
        await fetchPartners();
      }
    } catch (error) {
      message.error(error.message || "Không thể lưu thông tin đối tác");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partnerId) => {
    try {
      await deletePartner(partnerId);

      if (partners.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchPartners();
      }

      message.success("Đã xóa đối tác");
    } catch (error) {
      message.error(error.message || "Không thể xóa đối tác");
    }
  };

  const columns = [
    {
      title: (
        <Space size={6}>
          <UserOutlined />
          Họ tên đối tác
        </Space>
      ),
      dataIndex: "name",
      render: (value) => value || "-",
    },
    {
      title: (
        <Space size={6}>
          <BankOutlined />
          Công ty của đối tác
        </Space>
      ),
      dataIndex: "company",
      render: (value) => value || "-",
    },
    {
      title: (
        <Space size={6}>
          <MailOutlined />
          Mail đối tác
        </Space>
      ),
      dataIndex: "email",
      render: (value) => value || "-",
    },
    {
      title: (
        <Space size={6}>
          <PhoneOutlined />
          Số điện thoại đối tác
        </Space>
      ),
      dataIndex: "phone",
      render: (value) => value || "-",
    },
    {
      title: "Thao tác",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa đối tác?"
            description="Bạn có chắc chắn muốn xóa đối tác này không?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
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
            "radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 40%), linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)",
        }}
      >
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: "100%", justifyContent: "space-between" }}
          size="middle"
        >
          <div>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              Đối tác
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {total} đối tác trong hệ thống
            </Text>
          </div>

          <Button
            type="primary"
            block={isMobile}
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm đối tác
          </Button>
        </Space>
      </div>

      <Input.Search
        placeholder="Tìm theo tên đối tác hoặc công ty..."
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
          {partners.length ? (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {partners.map((partner) => (
                <PartnerMobileCard
                  key={partner._id}
                  partner={partner}
                  onEdit={openEditModal}
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
            <Empty description={loading ? "Đang tải..." : "Không có đối tác"} />
          )}
        </Spin>
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={partners}
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (nextPage) => setPage(nextPage),
          }}
          scroll={{ x: 960 }}
          locale={{ emptyText: loading ? "Đang tải..." : "Không có đối tác" }}
        />
      )}

      <Modal
        open={editor.open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editor.partnerId ? "Lưu thay đổi" : "Thêm đối tác"}
        cancelText="Hủy"
        title={editor.partnerId ? "Chỉnh sửa đối tác" : "Thêm đối tác"}
        confirmLoading={saving}
        width={isMobile ? "100%" : 520}
        centered={!isMobile}
        style={isMobile ? { top: 8 } : undefined}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size={isMobile ? "large" : "middle"}
        >
          <Form.Item
            name="name"
            label="Họ tên đối tác"
            rules={[{ required: true, message: "Vui lòng nhập họ tên đối tác" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item name="company" label="Công ty của đối tác">
            <Input prefix={<BankOutlined />} placeholder="Nhập công ty" />
          </Form.Item>

          <Form.Item name="email" label="Mail đối tác">
            <Input prefix={<MailOutlined />} placeholder="name@company.com" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại đối tác">
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
