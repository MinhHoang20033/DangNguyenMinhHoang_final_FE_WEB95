import { Button, Card, Col, Empty, Input, Modal, Row, Space, Table, Typography } from "antd";
import { EMPTY_VALUE } from "@/features/project";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

const PROGRESS_SUBTITLE_PLACEHOLDER = "Kế hoạch và báo cáo tiến độ thi công dự án";

export function ProjectProgressSection() {
  const {
    progressSection,
    hasProgressColumns,
    progressConfigEditor,
    setProgressConfigEditor,
    submitProgressConfigUpdate,
    addProgressConfigColumn,
    updateProgressConfigColumnName,
    removeProgressConfigColumn,
    saving,
    openProgressRowEditor,
    removeProgressRow,
    canManageTasks,
    openProgressConfigEditor,
    progressRowEditor,
    setProgressRowEditor,
    submitProgressRowUpdate,
  } = useProjectDetailModel();

  const tableColumns = [
    ...(progressSection.columns ?? []).map((column) => ({
      title: column.name || "Tham số",
      dataIndex: ["values", column.id],
      width: 220,
      render: (value) => value || EMPTY_VALUE,
    })),
    ...(canManageTasks
      ? [
          {
            title: "Thao tác",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openProgressRowEditor(record.id)}>Cập nhật</Button>
                <Button danger onClick={() => removeProgressRow(record.id)} loading={saving}>
                  Xóa
                </Button>
              </Space>
            ),
            width: 180,
            fixed: "right",
          },
        ]
      : []),
  ];

  return (
    <>
      <Card
        title="Tiến độ dự án"
        extra={
          <Space wrap>
            {canManageTasks && (
              <Button onClick={openProgressConfigEditor}>
                {hasProgressColumns ? "Chỉnh sửa tham số" : "Thiết lập tham số"}
              </Button>
            )}
            {hasProgressColumns && canManageTasks && (
              <Button type="primary" onClick={() => openProgressRowEditor()}>
                Thêm dòng
              </Button>
            )}
          </Space>
        }
      >
        {!hasProgressColumns ? (
          <Empty
            description={
              canManageTasks
                ? "Chưa thiết lập tham số tiến độ. Bấm «Thiết lập tham số» để bắt đầu."
                : "Chưa có dữ liệu tiến độ dự án"
            }
          />
        ) : (
          <>
            {!!progressSection.subtitle && (
              <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                {progressSection.subtitle}
              </Text>
            )}
            <Table
              rowKey="id"
              columns={tableColumns}
              dataSource={progressSection.rows}
              pagination={false}
              locale={{ emptyText: <Empty description="Chưa có dòng tiến độ" /> }}
              scroll={{ x: 1100 }}
            />
          </>
        )}
      </Card>

      <Modal
        open={progressConfigEditor.open}
        title="Cấu hình tham số tiến độ"
        onCancel={() =>
          setProgressConfigEditor({
            open: false,
            subtitle: "",
            columns: [],
          })
        }
        onOk={() => submitProgressConfigUpdate()}
        okText="Lưu tham số"
        confirmLoading={saving}
        width={860}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text>Mô tả ngắn</Text>
            <Input
              value={progressConfigEditor.subtitle}
              placeholder={PROGRESS_SUBTITLE_PLACEHOLDER}
              onChange={(event) =>
                setProgressConfigEditor((current) => ({
                  ...current,
                  subtitle: event.target.value,
                }))
              }
            />
          </div>

          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text strong>Danh sách tham số</Text>
            <Button onClick={addProgressConfigColumn}>Thêm tham số</Button>
          </Space>

          <Space direction="vertical" style={{ width: "100%" }}>
            {progressConfigEditor.columns.map((column, index) => (
              <Space key={column.id} align="start" style={{ width: "100%" }}>
                <Input
                  value={column.name}
                  placeholder={`Tên tham số ${index + 1}`}
                  onChange={(event) => updateProgressConfigColumnName(column.id, event.target.value)}
                />
                <Button danger onClick={() => removeProgressConfigColumn(column.id)}>
                  Xóa
                </Button>
              </Space>
            ))}
          </Space>
        </Space>
      </Modal>

      <Modal
        open={progressRowEditor.open}
        title={progressRowEditor.rowId ? "Cập nhật dòng tiến độ" : "Thêm dòng tiến độ"}
        onCancel={() =>
          setProgressRowEditor({
            open: false,
            rowId: null,
            draftValues: {},
          })
        }
        onOk={submitProgressRowUpdate}
        okText="Lưu dữ liệu"
        confirmLoading={saving}
        width={820}
      >
        <Row gutter={[12, 12]}>
          {progressSection.columns.map((column) => (
            <Col span={12} key={column.id}>
              <Text>{column.name}</Text>
              <Input.TextArea
                rows={3}
                value={progressRowEditor.draftValues[column.id] ?? ""}
                onChange={(event) =>
                  setProgressRowEditor((current) => ({
                    ...current,
                    draftValues: {
                      ...current.draftValues,
                      [column.id]: event.target.value,
                    },
                  }))
                }
              />
            </Col>
          ))}
        </Row>
      </Modal>
    </>
  );
}
