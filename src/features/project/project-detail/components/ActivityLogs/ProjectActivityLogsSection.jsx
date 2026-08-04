import { useMemo, useState } from "react";
import { Avatar, Button, Card, Empty, Grid, Input, Select, Space, Tag, Typography } from "antd";

import { formatDateTime } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  ACTIVITY_SECTION_FILTER,
  ACTIVITY_SECTION_FILTER_OPTIONS,
  filterActivityLogs,
  getActivitySectionMeta,
  hasActiveActivityFilters,
} from "../../helpers/activityLogHelpers.js";
import {
  SECTION_SCROLL,
  createScrollBoxStyle,
  sectionCardStyle,
  sectionCardStyles,
  softItemCardStyle,
} from "../../helpers/sectionStyles.js";

const { Text, Title } = Typography;

const EMPTY_FILTERS = {
  keyword: "",
  section: ACTIVITY_SECTION_FILTER.ALL,
};

export function ProjectActivityLogsSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { activityLogs, findEmployeeByActorName } = useProjectDetailModel();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filteredLogs = useMemo(
    () => filterActivityLogs(activityLogs, filters),
    [activityLogs, filters],
  );

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <Card
      title={
        <div>
          <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
            Nhật ký thao tác
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {filteredLogs.length}/{activityLogs.length} thao tác
          </Text>
        </div>
      }
      style={sectionCardStyle}
      styles={sectionCardStyles}
    >
      {activityLogs.length ? (
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            wrap={!isMobile}
            size={12}
            style={{ width: "100%" }}
          >
            <Input.Search
              placeholder="Tìm theo nội dung hoặc người thao tác..."
              value={filters.keyword}
              onChange={(event) =>
                setFilters((current) => ({ ...current, keyword: event.target.value }))
              }
              allowClear
              style={{ width: isMobile ? "100%" : 280 }}
            />
            <Select
              value={filters.section}
              options={ACTIVITY_SECTION_FILTER_OPTIONS}
              onChange={(section) => setFilters((current) => ({ ...current, section }))}
              style={{ minWidth: isMobile ? "100%" : 180 }}
            />
            {hasActiveActivityFilters(filters) ? (
              <Button onClick={resetFilters}>Xóa bộ lọc</Button>
            ) : null}
          </Space>

          {filteredLogs.length ? (
            <div style={createScrollBoxStyle(SECTION_SCROLL.activityLogs)}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {filteredLogs.map((log) => {
                  const sectionMeta = getActivitySectionMeta(log.sectionKey);
                  const actor = findEmployeeByActorName(log.actorName);

                  return (
                    <div
                      key={log.id}
                      style={{
                        ...softItemCardStyle,
                        padding: isMobile ? "12px 14px" : "14px 16px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <Avatar src={actor?.avatar || undefined}>
                        {(log.actorName || "N").trim().charAt(0).toUpperCase()}
                      </Avatar>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Space wrap size={[8, 8]} style={{ marginBottom: 6 }}>
                          <Text strong>{log.actorName || "Nhân viên"}</Text>
                          <Tag color={sectionMeta.color}>{sectionMeta.label}</Tag>
                        </Space>

                        <Text style={{ display: "block", wordBreak: "break-word" }}>
                          {log.text ||
                            `${log.actorName || "Nhân viên"} đã chỉnh sửa ${
                              log.sectionLabel || "bảng dữ liệu"
                            }`}
                        </Text>

                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
                          {formatDateTime(log.createdAt)}
                          {log.sectionLabel ? ` · ${log.sectionLabel}` : ""}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </Space>
            </div>
          ) : (
            <Empty description="Không có nhật ký phù hợp với bộ lọc" />
          )}
        </Space>
      ) : (
        <Empty description="Chưa có nhật ký thao tác" />
      )}
    </Card>
  );
}
