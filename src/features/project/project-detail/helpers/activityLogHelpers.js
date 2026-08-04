export const ACTIVITY_SECTION_FILTER = {
  ALL: "all",
  TASKS: "tasks",
  FILES: "relatedFiles",
  PROGRESS: "progressChecks",
  OVERVIEW: "overview",
  MEMBERS: "members",
  OTHER: "other",
};

export const ACTIVITY_SECTION_FILTER_OPTIONS = [
  { value: ACTIVITY_SECTION_FILTER.ALL, label: "Tất cả" },
  { value: ACTIVITY_SECTION_FILTER.TASKS, label: "Công việc" },
  { value: ACTIVITY_SECTION_FILTER.FILES, label: "Tệp liên quan" },
  { value: ACTIVITY_SECTION_FILTER.PROGRESS, label: "Tiến độ" },
  { value: ACTIVITY_SECTION_FILTER.OVERVIEW, label: "Thông tin dự án" },
  { value: ACTIVITY_SECTION_FILTER.MEMBERS, label: "Nhân sự" },
  { value: ACTIVITY_SECTION_FILTER.OTHER, label: "Khác" },
];

const KNOWN_SECTION_KEYS = new Set([
  ACTIVITY_SECTION_FILTER.TASKS,
  ACTIVITY_SECTION_FILTER.FILES,
  ACTIVITY_SECTION_FILTER.PROGRESS,
  ACTIVITY_SECTION_FILTER.OVERVIEW,
  ACTIVITY_SECTION_FILTER.MEMBERS,
]);

export const getActivitySectionMeta = (sectionKey = "") => {
  switch (sectionKey) {
    case ACTIVITY_SECTION_FILTER.TASKS:
      return { label: "Công việc", color: "blue" };
    case ACTIVITY_SECTION_FILTER.FILES:
      return { label: "Tệp liên quan", color: "purple" };
    case ACTIVITY_SECTION_FILTER.PROGRESS:
      return { label: "Tiến độ", color: "cyan" };
    case ACTIVITY_SECTION_FILTER.OVERVIEW:
      return { label: "Thông tin dự án", color: "geekblue" };
    case ACTIVITY_SECTION_FILTER.MEMBERS:
      return { label: "Nhân sự", color: "orange" };
    default:
      return { label: "Khác", color: "default" };
  }
};

export const filterActivityLogs = (logs = [], { keyword = "", section = ACTIVITY_SECTION_FILTER.ALL } = {}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return logs.filter((log) => {
    const sectionKey = log.sectionKey || "";

    if (section === ACTIVITY_SECTION_FILTER.OTHER) {
      if (KNOWN_SECTION_KEYS.has(sectionKey)) {
        return false;
      }
    } else if (section !== ACTIVITY_SECTION_FILTER.ALL && sectionKey !== section) {
      return false;
    }

    if (!normalizedKeyword) {
      return true;
    }

    const haystack = `${log.text ?? ""} ${log.actorName ?? ""} ${log.sectionLabel ?? ""}`.toLowerCase();
    return haystack.includes(normalizedKeyword);
  });
};

export const hasActiveActivityFilters = ({ keyword = "", section = ACTIVITY_SECTION_FILTER.ALL } = {}) =>
  Boolean(keyword.trim()) || section !== ACTIVITY_SECTION_FILTER.ALL;
