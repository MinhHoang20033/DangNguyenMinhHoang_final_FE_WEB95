export const ACCOUNT_ROLE_LABELS = {
  PM: { label: "Quản lý dự án", color: "purple" },
  employee: { label: "Nhân viên", color: "blue" },
};

export const ACCOUNT_ROLE_EMPTY_LABEL = "Chưa có";

export const getAccountRolePresentation = (role) =>
  ACCOUNT_ROLE_LABELS[role] ?? null;
