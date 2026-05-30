import { Avatar, Card, Empty, Space, Typography } from "antd";

import { formatDateTime } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

export function ProjectActivityLogsSection() {
  const { activityLogs, findEmployeeByActorName } = useProjectDetailModel();

  return (
    <Card title="Nhật ký thao tác">
      {activityLogs.length ? (
        <div style={{ maxHeight: 160, overflowY: "auto", paddingRight: 8 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {activityLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                }}
              >
                <Avatar src={findEmployeeByActorName(log.actorName)?.avatar || undefined}>
                  {(log.actorName || "N").trim().charAt(0).toUpperCase()}
                </Avatar>
                <Space
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Text>{log.text || `${log.actorName || "Nhân viên"} đã chỉnh sửa ${log.sectionLabel || "bảng dữ liệu"}`}</Text>
                  <Text type="secondary">{formatDateTime(log.createdAt)}</Text>
                </Space>
              </div>
            ))}
          </Space>
        </div>
      ) : (
        <Empty description="Chưa có nhật ký thao tác" />
      )}
    </Card>
  );
}
