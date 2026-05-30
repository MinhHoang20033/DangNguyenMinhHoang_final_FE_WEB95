export const createEmptyPreviewState = () => ({
  open: false,
  file: null,
  type: "",
  loading: false,
  error: "",
  rows: [],
  sheetName: "",
  sheetNames: [],
  activeSheetName: "",
  columnCount: 0,
  html: "",
});
