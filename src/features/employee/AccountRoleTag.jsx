import { Tag } from "antd";

import { ACCOUNT_ROLE_EMPTY_LABEL, getAccountRolePresentation } from "./constants.js";

export function AccountRoleTag({ role }) {
  const meta = getAccountRolePresentation(role);

  if (!meta) {
    return <Tag>{ACCOUNT_ROLE_EMPTY_LABEL}</Tag>;
  }

  return <Tag color={meta.color}>{meta.label}</Tag>;
}
