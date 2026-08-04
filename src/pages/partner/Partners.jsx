import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { addPartner, deletePartner, getPartners, updatePartner } from "@/utils/api";

const { Title } = Typography;
const PAGE_SIZE = 10;

const createInitialEditorState = () => ({
  open: false,
  partnerId: null,
});

export default function Partners() {
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
      title: "Họ tên đối tác",
      dataIndex: "name",
      render: (value) => value || "-",
    },
    {
      title: "Công ty của đối tác",
      dataIndex: "company",
      render: (value) => value || "-",
    },
    {
      title: "Mail đối tác",
      dataIndex: "email",
      render: (value) => value || "-",
    },
    {
      title: "Số điện thoại đối tác",
      dataIndex: "phone",
      render: (value) => value || "-",
    },
    {
      title: "Thao tác",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Xóa đối tác?"
            description="Bạn có chắc chắn muốn xóa đối tác này không?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", marginBottom: 20 }}
      >
        <Space
          wrap
          style={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Đối tác
          </Title>

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Thêm đối tác
          </Button>
        </Space>

        <Input
          placeholder="Tìm kiếm theo tên đối tác hoặc công ty..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 360 }}
          allowClear
        />
      </Space>

      {loadError ? (
        <Empty description={loadError} style={{ marginTop: 40 }} />
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
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Họ tên đối tác"
            rules={[{ required: true, message: "Vui lòng nhập họ tên đối tác" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="company" label="Công ty của đối tác">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Mail đối tác">
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại đối tác">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
