import { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Space } from "antd";

import { getEmployees } from "@/utils/api";
import { EMPTY_VALUE } from "@/features/project";

const PAGE_SIZE = 10;

export function useProjectMembers({ project, isAdmin, saving, saveProject, setEmployees }) {
  const [search, setSearch] = useState("");
  const [memberToolboxOpen, setMemberToolboxOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadEmployeesError, setLoadEmployeesError] = useState(null);

  const memberEmployeeIdKey = useMemo(
    () =>
      (project?.members ?? [])
        .map((member) => member.employeeId)
        .sort()
        .join("|"),
    [project?.members],
  );

  const fetchAvailableEmployees = useCallback(async () => {
    if (!memberToolboxOpen || !isAdmin) {
      return;
    }

    setLoadingEmployees(true);
    setLoadEmployeesError(null);

    try {
      const excludeIds = memberEmployeeIdKey ? memberEmployeeIdKey.split("|").filter(Boolean) : [];
      const result = await getEmployees({
        page,
        limit: PAGE_SIZE,
        search: search.trim(),
        excludeIds,
      });
      setAvailableEmployees(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      setLoadEmployeesError(error.message || "Không tải được danh sách nhân viên");
      setAvailableEmployees([]);
      setTotal(0);
    } finally {
      setLoadingEmployees(false);
    }
  }, [isAdmin, memberEmployeeIdKey, memberToolboxOpen, page, search]);

  useEffect(() => {
    if (!memberToolboxOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      fetchAvailableEmployees();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [fetchAvailableEmployees, memberToolboxOpen, search]);

  const openMemberToolbox = () => {
    setSearch("");
    setPage(1);
    setMemberToolboxOpen(true);
  };

  const closeMemberToolbox = () => {
    setMemberToolboxOpen(false);
    setSearch("");
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const addMemberToProject = async (employee) => {
    const updated = await saveProject(
      (fresh) => ({
        members: [...(fresh.members ?? []), { employeeId: employee._id }],
      }),
      "Đã thêm thành viên",
    );

    if (!updated) {
      return;
    }

    setEmployees((current) => {
      if (current.some((item) => item._id === employee._id)) {
        return current;
      }

      return [...current, employee];
    });

    closeMemberToolbox();
  };

  const removeMember = async (employeeId) => {
    await saveProject(
      (fresh) => ({
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
      title: "Chức danh",
      dataIndex: "role",
      width: 140,
      render: (value) => value || EMPTY_VALUE,
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Button type="primary" onClick={() => addMemberToProject(record)}>
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
      dataIndex: "role",
      width: 140,
      render: (value) => value || EMPTY_VALUE,
    },
    {
      title: "Thao tác",
      render: (_, record) =>
        isAdmin ? (
          <Space size="small" wrap>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeMember(record._id)}
              loading={saving}
            >
              Xóa
            </Button>
          </Space>
        ) : null,
      width: 220,
    },
  ];

  return {
    search,
    setSearch: handleSearchChange,
    memberToolboxOpen,
    openMemberToolbox,
    closeMemberToolbox,
    page,
    setPage,
    total,
    loadingEmployees,
    loadEmployeesError,
    availableEmployees,
    addMemberToProject,
    removeMember,
    employeeColumns,
    memberColumns,
  };
}
