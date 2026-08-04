import { Card, Grid, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";

import { EMPTY_VALUE, getProjectOverviewStatus } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  fieldChipStyle,
  sectionCardStyle,
  sectionCardStyles,
} from "../../helpers/sectionStyles.js";

const { Text, Title } = Typography;

export function ProjectOverviewSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { project } = useProjectDetailModel();
  const overviewStatus = getProjectOverviewStatus(project);

  const deadlineLabel = project.deadline
    ? dayjs(project.deadline).isValid()
      ? dayjs(project.deadline).format("DD/MM/YYYY")
      : project.deadline
    : EMPTY_VALUE;

  const fields = [
    {
      key: "name",
      label: "Tên dự án",
      value: project.name || EMPTY_VALUE,
    },
    {
      key: "status",
      label: "Trạng thái",
      node: <Tag color={overviewStatus.tagColor}>{overviewStatus.label}</Tag>,
    },
    { key: "deadline", label: "Hạn dự án", value: deadlineLabel },
    { key: "manager", label: "Quản lý dự án", value: project.managerName || EMPTY_VALUE },
    { key: "site", label: "Công trình", value: project.siteName || EMPTY_VALUE },
    { key: "code", label: "Mã số", value: project.code || EMPTY_VALUE },
    { key: "desc", label: "Mô tả", value: project.desc || EMPTY_VALUE, multiline: true },
  ];

  return (
    <Card
      title={
        <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
          Tổng quan dự án
        </Title>
      }
      style={sectionCardStyle}
      styles={sectionCardStyles}
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {fields.map((field) => (
          <div
            key={field.key}
            style={{
              ...fieldChipStyle,
              display: "flex",
              flexDirection: isMobile || field.multiline ? "column" : "row",
              alignItems: isMobile || field.multiline ? "stretch" : "center",
              gap: isMobile || field.multiline ? 6 : 16,
              justifyContent: "space-between",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, minWidth: 120 }}>
              {field.label}
            </Text>
            {field.node || (
              <Text
                strong={!field.multiline}
                style={{
                  wordBreak: "break-word",
                  whiteSpace: field.multiline ? "pre-wrap" : "normal",
                  textAlign: isMobile || field.multiline ? "left" : "right",
                  flex: 1,
                }}
              >
                {field.value}
              </Text>
            )}
          </div>
        ))}
      </Space>
    </Card>
  );
}
