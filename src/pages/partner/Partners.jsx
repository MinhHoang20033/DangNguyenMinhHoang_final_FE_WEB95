import { useEffect, useMemo, useState } from "react";
import {
  Button,
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

const createInitialEditorState = () => ({
  open: false,
  partnerId: null,
});

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(createInitialEditorState());
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPartners();
        setPartners(data ?? []);
      } catch (error) {
        message.error(error.message || "Không thể tải danh sách đối tác");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPartners = useMemo(
    () =>
      partners.filter((partner) => {
        const keyword = search.toLowerCase();
        return (
          (partner.name || "").toLowerCase().includes(keyword) ||
          (partner.company || "").toLowerCase().includes(keyword)
        );
      }),
    [partners, search],
  );

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
      if (editor.partnerId) {
        const updated = await updatePartner(editor.partnerId, values);
        setPartners((current) =>
          current.map((partner) => (partner._id === editor.partnerId ? updated : partner)),
        );
        message.success("Đã cập nhật thông tin đối tác");
      } else {
        const created = await addPartner(values);
        setPartners((current) => [created, ...current]);
        message.success("Đã thêm đối tác");
      }

      closeModal();
    } catch (error) {
      message.error(error.message || "Không thể lưu thông tin đối tác");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partnerId) => {
    try {
      await deletePartner(partnerId);
      setPartners((current) => current.filter((partner) => partner._id !== partnerId));
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
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: 360 }}
        />
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredPartners}
        loading={loading}
        pagination={false}
        scroll={{ x: 960 }}
      />

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
