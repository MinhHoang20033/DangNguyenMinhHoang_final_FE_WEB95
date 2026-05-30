import { Empty, Modal, Select, Space, Typography } from "antd";
import { Grid } from "react-window";
import * as XLSX from "xlsx";

import {
  EXCEL_COLUMN_WIDTH,
  EXCEL_PREVIEW_HEIGHT,
  EXCEL_ROW_HEIGHT,
  FILE_BASE_URL,
} from "@/features/project";
import { ExcelDataCell, ExcelRowIndexCell } from "./ExcelPreviewCells.jsx";

const { Text } = Typography;

export function FilePreviewModal({
  previewState,
  activeExcelRows,
  onClose,
  onExcelSheetChange,
}) {
  return (
    <Modal
      open={previewState.open}
      title={previewState.file?.name || "Xem trước tệp"}
      footer={null}
      onCancel={onClose}
      width={980}
    >
      {previewState.loading ? (
        <Text>Đang tải xem trước...</Text>
      ) : previewState.type === "pdf" ? (
        <iframe
          title={previewState.file?.name || "preview-pdf"}
          src={`${FILE_BASE_URL}${previewState.file?.url || ""}`}
          style={{ width: "100%", height: 620, border: 0, borderRadius: 12 }}
        />
      ) : previewState.type === "excel" ? (
        <div>
          <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
            <Text type="secondary">
              Sheet hiện tại: {previewState.activeSheetName || previewState.sheetName || "Mặc định"}
            </Text>
            <Select
              style={{ width: 240 }}
              value={previewState.activeSheetName || previewState.sheetName}
              onChange={onExcelSheetChange}
              options={previewState.sheetNames.map((sheetName) => ({
                value: sheetName,
                label: sheetName,
              }))}
            />
          </Space>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 48,
                background: "#f8fafc",
                borderRight: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
              }}
            />
            <div style={{ overflowX: "auto", overflowY: "hidden", borderBottom: "1px solid #e5e7eb" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${previewState.columnCount}, ${EXCEL_COLUMN_WIDTH}px)`,
                  width: previewState.columnCount * EXCEL_COLUMN_WIDTH,
                  minHeight: 48,
                  background: "#f8fafc",
                }}
              >
                {Array.from({ length: previewState.columnCount }).map((_, columnIndex) => (
                  <div
                    key={`excel-header-${columnIndex}`}
                    style={{
                      padding: "12px 10px",
                      borderRight: "1px solid #e5e7eb",
                      fontWeight: 600,
                    }}
                  >
                    {XLSX.utils.encode_col(columnIndex)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRight: "1px solid #e5e7eb" }}>
              <Grid
                cellComponent={ExcelRowIndexCell}
                cellProps={{}}
                columnCount={1}
                columnWidth={80}
                defaultHeight={EXCEL_PREVIEW_HEIGHT}
                defaultWidth={80}
                rowCount={Math.max(activeExcelRows.length, 1)}
                rowHeight={EXCEL_ROW_HEIGHT}
                style={{ height: EXCEL_PREVIEW_HEIGHT, width: 80 }}
              />
            </div>

            <div style={{ overflow: "hidden" }}>
              <Grid
                cellComponent={ExcelDataCell}
                cellProps={{ rows: activeExcelRows }}
                columnCount={previewState.columnCount}
                columnWidth={EXCEL_COLUMN_WIDTH}
                defaultHeight={EXCEL_PREVIEW_HEIGHT}
                defaultWidth={880}
                rowCount={Math.max(activeExcelRows.length, 1)}
                rowHeight={EXCEL_ROW_HEIGHT}
                style={{ height: EXCEL_PREVIEW_HEIGHT, width: 880 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Text type="secondary">
              {activeExcelRows.length} dòng • {previewState.columnCount} cột
            </Text>
          </div>
        </div>
      ) : previewState.type === "word" ? (
        <div
          style={{ maxHeight: 620, overflow: "auto", padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}
          dangerouslySetInnerHTML={{ __html: previewState.html || "<p>Không có nội dung để hiển thị.</p>" }}
        />
      ) : (
        <Empty description={previewState.error || "Định dạng này chưa hỗ trợ xem trước trực tiếp"} />
      )}
    </Modal>
  );
}
