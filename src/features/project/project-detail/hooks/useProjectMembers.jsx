import { useEffect, useState } from "react";
import { Avatar, Button, Space, Tag, Typography } from "antd";

import { EMPLOYEE_BATCH_SIZE, EMPTY_VALUE } from "@/features/project";

const { Text } = Typography;

export function useProjectMembers({ project, employees, isAdmin, saving, saveProject }) {
  const [search, setSearch] = useState("");
  const [memberToolboxOpen, setMemberToolboxOpen] = useState(false);
  const [visibleEmployeeCount, setVisibleEmployeeCount] = useState(EMPLOYEE_BATCH_SIZE);

  const members = project?.members ?? [];

  useEffect(() => {
    if (memberToolboxOpen) {
      setVisibleEmployeeCount(EMPLOYEE_BATCH_SIZE);
    }
  }, [memberToolboxOpen, search]);

  const availableEmployees = employees
    .filter((employee) => !members.some((member) => member.employeeId === employee._id))
    .filter((employee) => employee.name?.toLowerCase().includes(search.toLowerCase()));
  const visibleAvailableEmployees = availableEmployees.slice(0, visibleEmployeeCount);

  const handleMemberListScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (!reachedBottom || visibleEmployeeCount >= availableEmployees.length) {
      return;
    }

    setVisibleEmployeeCount((current) =>
      Math.min(current + EMPLOYEE_BATCH_SIZE, availableEmployees.length),
    );
  };

  const addMemberToProject = async (employeeId) => {
    const updated = await saveProject(
      (fresh) => ({
        members: [...(fresh.members ?? []), { employeeId, assignment: "" }],
      }),
      "Đã thêm thành viên",
    );

    if (!updated) {
      return;
    }

    setMemberToolboxOpen(false);
    setSearch("");
  };

  const removeMember = async (employeeId) => {
    await saveProject(
      (fresh) => ({
        managerId: fresh.managerId === employeeId ? "" : fresh.managerId,
        members: (fresh.members ?? []).filter((member) => member.employeeId !== employeeId),
      }),
      "Đã xóa thành viên",
    );
  };

  const employeeColumns = [
    {
      title: "Ảnh",
      render: (_, record) => (
        <Avatar src={record.avatar || undefined}>
          {(record.name || "N").trim().charAt(0).toUpperCase()}
        </Avatar>
      ),
      width: 80,
    },
    {
      title: "Tên",
      dataIndex: "name",
      width: 180,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 140,
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Button type="primary" onClick={() => addMemberToProject(record._id)}>
          Thêm vào dự án
        </Button>
      ),
      width: 180,
    },
  ];

  const memberColumns = [
    {
      title: "Ảnh",
      render: (_, record) => (
        <Avatar src={record.avatar || undefined}>
          {(record.name || "N").trim().charAt(0).toUpperCase()}
        </Avatar>
      ),
      width: 80,
    },
    {
      title: "Mã NV",
      dataIndex: "employeeCode",
      width: 90,
      render: (value) => value || "----",
    },
    {
      title: "Tên",
      dataIndex: "name",
      width: 180,
    },
    {
      title: "Vai trò",
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          <Text>{record.role || EMPTY_VALUE}</Text>
          {record._id === project?.managerId ? <Tag color="blue">Quản lý dự án</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      render: (_, record) =>
        isAdmin ? (
          <Space size="small" wrap>
            <Button size="small" danger onClick={() => removeMember(record._id)} loading={saving}>
              Xóa
            </Button>
          </Space>
        ) : null,
      width: 220,
    },
  ];

  return {
    search,
    setSearch,
    memberToolboxOpen,
    setMemberToolboxOpen,
    visibleEmployeeCount,
    setVisibleEmployeeCount,
    members,
    availableEmployees,
    visibleAvailableEmployees,
    handleMemberListScroll,
    addMemberToProject,
    removeMember,
    employeeColumns,
    memberColumns,
  };
}
