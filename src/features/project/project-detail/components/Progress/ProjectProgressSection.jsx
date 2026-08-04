import {
  Button,
  Card,
  Col,
  Empty,
  Grid,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { EMPTY_VALUE } from "@/features/project";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text, Title } = Typography;

const PROGRESS_SUBTITLE_PLACEHOLDER = "Kế hoạch và báo cáo tiến độ thi công dự án";

function ProgressMobileCards({
  columns,
  rows,
  canManageTasks,
  openProgressRowEditor,
  removeProgressRow,
  saving,
}) {
  if (!rows?.length) {
    return <Empty description="Chưa có dòng tiến độ" />;
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {rows.map((row, rowIndex) => {
        const primaryColumn = columns[0];
        const primaryValue = primaryColumn
          ? row.values?.[primaryColumn.id] || EMPTY_VALUE
          : `Dòng ${rowIndex + 1}`;

        return (
          <Card
            key={row.id}
            size="small"
            style={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
            }}
            styles={{ body: { padding: 14 } }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dòng {rowIndex + 1}
                    {primaryColumn?.name ? ` · ${primaryColumn.name}` : ""}
                  </Text>
                  <Title
                    level={5}
                    style={{
                      margin: "4px 0 0",
                      wordBreak: "break-word",
                      lineHeight: 1.35,
                    }}
                  >
                    {primaryValue}
                  </Title>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {rowIndex + 1}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                }}
              >
                {columns.slice(primaryColumn ? 1 : 0).map((column) => {
                  const value = row.values?.[column.id];
                  return (
                    <div
                      key={`${row.id}-${column.id}`}
                      style={{
                        borderRadius: 12,
                        background: "#fff",
                        border: "1px solid #eef2f7",
                        padding: "10px 12px",
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        {column.name || "Tham số"}
                      </Text>
                      <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {value || EMPTY_VALUE}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {canManageTasks && (
                <Space style={{ width: "100%" }} size="small">
                  <Button
                    block
                    type="primary"
                    ghost
                    onClick={() => openProgressRowEditor(row.id)}
                  >
                    Cập nhật
                  </Button>
                  <Button
                    block
                    danger
                    onClick={() => removeProgressRow(row.id)}
                    loading={saving}
                  >
                    Xóa
                  </Button>
                </Space>
              )}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}

export function ProjectProgressSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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
          !isMobile ? (
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
          ) : null
        }
      >
        {isMobile && canManageTasks && (
          <Space style={{ width: "100%", marginBottom: 14 }} size="small">
            <Button block onClick={openProgressConfigEditor}>
              {hasProgressColumns ? "Tham số" : "Thiết lập"}
            </Button>
            {hasProgressColumns && (
              <Button block type="primary" onClick={() => openProgressRowEditor()}>
                Thêm dòng
              </Button>
            )}
          </Space>
        )}

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
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                {progressSection.subtitle}
              </Text>
            )}

            {isMobile ? (
              <ProgressMobileCards
                columns={progressSection.columns ?? []}
                rows={progressSection.rows ?? []}
                canManageTasks={canManageTasks}
                openProgressRowEditor={openProgressRowEditor}
                removeProgressRow={removeProgressRow}
                saving={saving}
              />
            ) : (
              <Table
                rowKey="id"
                columns={tableColumns}
                dataSource={progressSection.rows}
                pagination={false}
                locale={{ emptyText: <Empty description="Chưa có dòng tiến độ" /> }}
                scroll={{ x: 1100 }}
              />
            )}
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
        width={isMobile ? "100%" : 860}
        centered={!isMobile}
        style={isMobile ? { top: 8 } : undefined}
        styles={{
          body: {
            maxHeight: isMobile ? "70dvh" : undefined,
            overflow: isMobile ? "auto" : undefined,
          },
        }}
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

          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Text strong>Danh sách tham số</Text>
            <Button block={isMobile} onClick={addProgressConfigColumn}>
              Thêm tham số
            </Button>
          </Space>

          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {progressConfigEditor.columns.map((column, index) => (
              <Space.Compact key={column.id} style={{ width: "100%" }}>
                <Input
                  value={column.name}
                  placeholder={`Tên tham số ${index + 1}`}
                  onChange={(event) =>
                    updateProgressConfigColumnName(column.id, event.target.value)
                  }
                />
                <Button danger onClick={() => removeProgressConfigColumn(column.id)}>
                  Xóa
                </Button>
              </Space.Compact>
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
        width={isMobile ? "100%" : 820}
        centered={!isMobile}
        style={isMobile ? { top: 8 } : undefined}
        styles={{
          body: {
            maxHeight: isMobile ? "70dvh" : undefined,
            overflow: isMobile ? "auto" : undefined,
          },
        }}
      >
        <Row gutter={[12, 12]}>
          {progressSection.columns.map((column) => (
            <Col xs={24} md={12} key={column.id}>
              <Text style={{ display: "block", marginBottom: 6 }}>{column.name}</Text>
              <Input.TextArea
                rows={isMobile ? 2 : 3}
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
