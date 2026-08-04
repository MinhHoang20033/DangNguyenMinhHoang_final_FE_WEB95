import { DeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Grid, Input, Modal, Popconfirm, Space, Table, Typography } from "antd";

import { EMPTY_VALUE } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  SECTION_SCROLL,
  createScrollBoxStyle,
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
    confirmRemoveMember,
    removeMember,
    addSelectedMembersToProject,
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    addingMembers,
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
          <Button type="primary" block onClick={openMemberToolbox} style={{ marginBottom: 14 }}>
            Thêm thành viên
          </Button>
        )}

        {!memberEmployees.length ? (
          <Empty description="Chưa có thành viên" />
        ) : (
          <div style={createScrollBoxStyle(SECTION_SCROLL.members)}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {memberEmployees.map((member) => (
                <div
                  key={member._id}
                  style={{
                    ...softItemCardStyle,
                    padding: isMobile ? "12px 14px" : "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <Space align="center" style={{ minWidth: 0, flex: 1 }}>
                    <Avatar size={isMobile ? 40 : 44} src={member.avatar || undefined}>
                      {(member.name || "N").trim().charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text strong style={{ display: "block" }}>
                        {member.name || EMPTY_VALUE}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {member.employeeCode || "----"} · {member.role || EMPTY_VALUE}
                      </Text>
                    </div>
                  </Space>
                  {isAdmin && (
                    <Popconfirm
                      title="Xóa thành viên khỏi dự án?"
                      onConfirm={() => removeMember(member._id)}
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={saving}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {isAdmin && (
        <Modal
          open={memberToolboxOpen}
          title="Thêm thành viên"
          onCancel={closeMemberToolbox}
          footer={
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={closeMemberToolbox}>Hủy</Button>
              <Button
                type="primary"
                disabled={!selectedEmployeeIds.length}
                loading={addingMembers}
                onClick={addSelectedMembersToProject}
              >
                Thêm {selectedEmployeeIds.length ? `${selectedEmployeeIds.length} thành viên` : "thành viên"}
              </Button>
            </Space>
          }
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
              rowSelection={{
                selectedRowKeys: selectedEmployeeIds,
                onChange: setSelectedEmployeeIds,
                preserveSelectedRowKeys: true,
              }}
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
