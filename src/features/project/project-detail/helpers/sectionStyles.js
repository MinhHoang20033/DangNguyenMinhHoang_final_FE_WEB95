export const sectionCardStyle = {
  borderRadius: 20,
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  height: "100%",
};

export const sectionCardStyles = {
  header: {
    borderBottom: "1px solid #eef2f7",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  },
  body: {
    background: "#fcfdff",
  },
};

export const softItemCardStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
};

export const fieldChipStyle = {
  borderRadius: 14,
  background: "#fff",
  border: "1px solid #eef2f7",
  padding: "10px 12px",
};

/** Scroll area so long lists don't stretch the whole page */
export const createScrollBoxStyle = (maxHeight) => ({
  maxHeight,
  overflowY: "auto",
  overflowX: "hidden",
  paddingRight: 4,
  WebkitOverflowScrolling: "touch",
});

export const SECTION_SCROLL = {
  members: 360,
  tasks: 560,
  progress: 480,
  files: 420,
};
