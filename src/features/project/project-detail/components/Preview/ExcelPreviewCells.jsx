import { EMPTY_VALUE } from "../../../shared/constants.js";

const baseCellStyle = {
  padding: "8px 10px",
  borderRight: "1px solid #e5e7eb",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  background: "#ffffff",
};

export function ExcelRowIndexCell({ rowIndex, style }) {
  return (
    <div
      style={{
        ...style,
        ...baseCellStyle,
        justifyContent: "center",
        fontWeight: 600,
        background: "#f8fafc",
      }}
    >
      {rowIndex + 1}
    </div>
  );
}

export function ExcelDataCell({ rowIndex, columnIndex, style, rows }) {
  const row = rows?.[rowIndex];
  const value = Array.isArray(row) ? row[columnIndex] : "";

  return (
    <div style={{ ...style, ...baseCellStyle }} title={value || EMPTY_VALUE}>
      {value || EMPTY_VALUE}
    </div>
  );
}
