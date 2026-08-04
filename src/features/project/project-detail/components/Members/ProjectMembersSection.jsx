import { Button, Card, Empty, Input, Modal, Table } from "antd";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const PAGE_SIZE = 10;

export function ProjectMembersSection() {
  const {
    isAdmin,
    openMemberToolbox,
    closeMemberToolbox,
    memberColumns,
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
  } = useProjectDetailModel();

  return (
    <>
      <Card
        size="small"
        title="Thành viên dự án"
        extra={isAdmin ? <Button onClick={openMemberToolbox}>Thêm thành viên</Button> : null}
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
          onCancel={closeMemberToolbox}
          footer={null}
          width={900}
        >
          <Input
            placeholder="Tìm kiếm theo tên, mã NV hoặc chức danh..."
            style={{ maxWidth: 320, marginBottom: 16 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />

          {loadEmployeesError ? (
            <Empty description={loadEmployeesError} style={{ marginTop: 24 }} />
          ) : (
            <>
              <Table
                rowKey="_id"
                columns={employeeColumns}
                dataSource={availableEmployees}
                loading={loadingEmployees}
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
            </>
          )}
        </Modal>
      )}
    </>
  );
}
