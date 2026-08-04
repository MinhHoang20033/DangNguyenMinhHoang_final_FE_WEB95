import { message } from "antd";

import { getProject, updateProject } from "@/utils/api";

export function useProjectSave({ projectId, setProject, setSaving }) {
  const saveProject = async (patchOrBuilder, successMessage = "Cập nhật dự án thành công") => {
    setSaving(true);

    try {
      const fresh = await getProject(projectId);
      const { activityLogs: _logs, ...projectPayload } = fresh;
      const patch =
        typeof patchOrBuilder === "function" ? patchOrBuilder(fresh) : patchOrBuilder;
      const updatedProject = await updateProject(projectId, { ...projectPayload, ...patch });
      setProject(updatedProject);
      if (successMessage) {
        message.success(successMessage);
      }
      return updatedProject;
    } catch (error) {
      message.error(error.message || "Không thể cập nhật dự án");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saveProject };
}
