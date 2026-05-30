import { Button, Card, Input, Modal, Table, Typography } from "antd";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

export function ProjectMemberAssignmentSection() {
  const {
    isAdmin,
    setMemberToolboxOpen,
    memberColumns,
    memberEmployees,
    memberToolboxOpen,
    search,
    setSearch,
    handleMemberListScroll,
    employeeColumns,
    visibleAvailableEmployees,
    visibleEmployeeCount,
    availableEmployees,
  } = useProjectDetailModel();

  return (
    <>
      <Card
        size="small"
        title="Thành viên dự án"
        extra={isAdmin ? <Button onClick={() => setMemberToolboxOpen(true)}>Thêm thành viên</Button> : null}
        style={{ height: "100%" }}
        bodyStyle={{ height: "calc(100% - 57px)" }}
      >
        <Table
          rowKey="_id"
          columns={memberColumns}
          dataSource={memberEmployees}
          pagination={false}
          scroll={{ x: 790, y: 320 }}
        />
      </Card>

      {isAdmin && (
        <Modal
          open={memberToolboxOpen}
          title="Thêm thành viên"
          onCancel={() => setMemberToolboxOpen(false)}
          footer={null}
          width={900}
        >
          <Input
            placeholder="Tìm kiếm nhân viên..."
            style={{ width: 320, marginBottom: 16 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div
            style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}
            onScroll={handleMemberListScroll}
          >
            <Table
              rowKey="_id"
              columns={employeeColumns}
              dataSource={visibleAvailableEmployees}
              pagination={false}
              scroll={{ x: 700 }}
            />
            {visibleEmployeeCount < availableEmployees.length && (
              <div style={{ padding: "12px 0", textAlign: "center" }}>
                <Text type="secondary">Cuộn xuống để tải thêm nhân viên</Text>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
