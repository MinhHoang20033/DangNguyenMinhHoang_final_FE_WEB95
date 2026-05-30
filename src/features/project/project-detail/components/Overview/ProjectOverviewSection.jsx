import { Card, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

import { EMPTY_VALUE, getProjectOverviewStatus } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

export function ProjectOverviewSection() {
  const { project } = useProjectDetailModel();
  const overviewStatus = getProjectOverviewStatus(project);

  return (
    <Card title="Tổng quan dự án" style={{ height: "100%" }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Tên dự án">{project.name || EMPTY_VALUE}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={overviewStatus.tagColor}>{overviewStatus.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Hạn dự án">
          {project.deadline
            ? dayjs(project.deadline).isValid()
              ? dayjs(project.deadline).format("DD/MM/YYYY")
              : project.deadline
            : EMPTY_VALUE}
        </Descriptions.Item>
        <Descriptions.Item label="Quản lý dự án">
          {project.managerName || EMPTY_VALUE}
        </Descriptions.Item>
        <Descriptions.Item label="Công trình">{project.siteName || EMPTY_VALUE}</Descriptions.Item>
        <Descriptions.Item label="Mã số">{project.code || EMPTY_VALUE}</Descriptions.Item>
        <Descriptions.Item label="Biểu mẫu">{project.formNo || EMPTY_VALUE}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{project.desc || EMPTY_VALUE}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
