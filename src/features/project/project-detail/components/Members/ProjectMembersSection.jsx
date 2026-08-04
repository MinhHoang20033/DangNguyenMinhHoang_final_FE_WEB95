import { Avatar, Button, Card, Col, Empty, Grid, Input, Modal, Row, Space, Table, Typography } from "antd";

import { EMPTY_VALUE } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  sectionCardStyle,
  sectionCardStyles,
  softItemCardStyle,
} from "../../helpers/sectionStyles.js";

const { Text, Title } = Typography;
const PAGE_SIZE = 10;

export function ProjectMembersSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const {
    isAdmin,
    openMemberToolbox,
    closeMemberToolbox,
    memberEmployees,
    memberToolboxOpen,
    search,
    setSearch,
    employeeColumns,
    availableEmployees,
    page,
    setPage,
    total,
    loadingEmployees,
    loadEmployeesError,
    removeMember,
    saving,
  } = useProjectDetailModel();

  return (
    <>
      <Card
        title={
          <div>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              Phân công nhân sự
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {memberEmployees.length} thành viên trong dự án
            </Text>
          </div>
        }
        extra={
          !isMobile && isAdmin ? (
            <Button type="primary" onClick={openMemberToolbox}>
              Thêm thành viên
            </Button>
          ) : null
        }
        style={sectionCardStyle}
        styles={sectionCardStyles}
      >
        {isMobile && isAdmin && (
          <Button
            type="primary"
            block
            onClick={openMemberToolbox}
            style={{ marginBottom: 14 }}
          >
            Thêm thành viên
          </Button>
        )}

        {!memberEmployees.length ? (
          <Empty description="Chưa có thành viên" />
        ) : isMobile ? (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {memberEmployees.map((member) => (
              <Card key={member._id} size="small" style={softItemCardStyle} styles={{ body: { padding: 14 } }}>
                <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space align="start">
                    <Avatar size={44} src={member.avatar || undefined}>
                      {(member.name || "N").trim().charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text strong>{member.name || EMPTY_VALUE}</Text>
                      <div>
                        <Text type="secondary">
                          {member.employeeCode || "----"} · {member.role || EMPTY_VALUE}
                        </Text>
                      </div>
                    </div>
                  </Space>
                  {isAdmin && (
                    <Button danger type="link" loading={saving} onClick={() => removeMember(member._id)}>
                      Xóa
                    </Button>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        ) : (
          <Row gutter={[12, 12]}>
            {memberEmployees.map((member) => (
              <Col xs={24} md={12} xl={12} key={member._id}>
                <Card size="small" style={softItemCardStyle} styles={{ body: { padding: 16 } }}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space align="center">
                      <Avatar size={48} src={member.avatar || undefined}>
                        {(member.name || "N").trim().charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>
                          {member.name || EMPTY_VALUE}
                        </Text>
                        <div>
                          <Text type="secondary">{member.role || EMPTY_VALUE}</Text>
                        </div>
                      </div>
                    </Space>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: "1 1 120px",
                          borderRadius: 12,
                          border: "1px solid #eef2f7",
                          background: "#fff",
                          padding: "8px 10px",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                          Mã NV
                        </Text>
                        <Text strong>{member.employeeCode || "----"}</Text>
                      </div>
                      <div
                        style={{
                          flex: "1 1 120px",
                          borderRadius: 12,
                          border: "1px solid #eef2f7",
                          background: "#fff",
                          padding: "8px 10px",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                          Vai trò
                        </Text>
                        <Text strong>{member.role || EMPTY_VALUE}</Text>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button danger block loading={saving} onClick={() => removeMember(member._id)}>
                        Xóa khỏi dự án
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {isAdmin && (
        <Modal
          open={memberToolboxOpen}
          title="Thêm thành viên"
          onCancel={closeMemberToolbox}
          footer={null}
          width={isMobile ? "100%" : 900}
          centered={!isMobile}
          style={isMobile ? { top: 8 } : undefined}
        >
          <Input
            placeholder="Tìm kiếm theo tên, mã NV hoặc chức danh..."
            style={{ width: "100%", maxWidth: isMobile ? "100%" : 320, marginBottom: 16 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />

          {loadEmployeesError ? (
            <Empty description={loadEmployeesError} style={{ marginTop: 24 }} />
          ) : (
            <Table
              rowKey="_id"
              columns={employeeColumns}
              dataSource={availableEmployees}
              loading={loadingEmployees}
              size={isMobile ? "small" : "middle"}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total,
                showSizeChanger: false,
                onChange: (nextPage) => setPage(nextPage),
              }}
              scroll={{ x: 700 }}
              locale={{ emptyText: loadingEmployees ? "Đang tải..." : "Không có nhân viên" }}
            />
          )}
        </Modal>
      )}
    </>
  );
}
