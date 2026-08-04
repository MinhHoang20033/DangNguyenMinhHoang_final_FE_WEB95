import { Card, Col, Grid, Row, Tag, Typography } from "antd";
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
    { key: "status", label: "Trạng thái", node: <Tag color={overviewStatus.tagColor}>{overviewStatus.label}</Tag> },
    { key: "deadline", label: "Hạn dự án", value: deadlineLabel },
    { key: "manager", label: "Quản lý dự án", value: project.managerName || EMPTY_VALUE },
    { key: "site", label: "Công trình", value: project.siteName || EMPTY_VALUE },
    { key: "code", label: "Mã số", value: project.code || EMPTY_VALUE },
  ];

  return (
    <Card
      title={
        <div>
          <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
            Tổng quan dự án
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {project.name || "Chưa đặt tên dự án"}
          </Text>
        </div>
      }
      style={sectionCardStyle}
      styles={sectionCardStyles}
    >
      <Row gutter={[12, 12]}>
        {fields.map((field) => (
          <Col xs={24} sm={12} key={field.key}>
            <div style={fieldChipStyle}>
              <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
                {field.label}
              </Text>
              {field.node || (
                <Text strong style={{ wordBreak: "break-word" }}>
                  {field.value}
                </Text>
              )}
            </div>
          </Col>
        ))}
        <Col span={24}>
          <div style={{ ...fieldChipStyle, minHeight: isMobile ? undefined : 96 }}>
            <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
              Mô tả
            </Text>
            <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {project.desc || EMPTY_VALUE}
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
