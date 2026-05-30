import { message } from "antd";

import { getProject, updateProject } from "@/utils/api";
import { stripLegacyProjectFields } from "@/features/project";

/** Refetch project rồi merge patch — tránh ghi đè dữ liệu cũ từ React state */
export function useProjectSave({ projectId, setProject, setSaving }) {
  const saveProject = async (patchOrBuilder, successMessage = "Cập nhật dự án thành công") => {
    setSaving(true);

    try {
      const fresh = stripLegacyProjectFields(await getProject(projectId));
      const {
        activityLogs: _logs,
        updateHistory: _history,
        revision: _revision,
        ...projectPayload
      } = fresh;
      const patch =
        typeof patchOrBuilder === "function" ? patchOrBuilder(fresh) : patchOrBuilder;
      const updatedProject = await updateProject(projectId, { ...projectPayload, ...patch });
      const normalized = stripLegacyProjectFields(updatedProject);
      setProject(normalized);
      message.success(successMessage);
      return normalized;
    } catch (error) {
      message.error(error.message || "Không thể cập nhật dự án");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saveProject };
}
