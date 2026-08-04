import { useEffect, useRef } from "react";

import { getProject } from "@/utils/api";
import { mergeSyncedProject } from "../helpers/projectSyncHelpers.js";

export const PROJECT_SYNC_INTERVAL_MS = 4000;

export function useProjectSync({ projectId, setProject, enabled, pauseSync, skipTasks }) {
  const pauseSyncRef = useRef(pauseSync);
  const skipTasksRef = useRef(skipTasks);

  useEffect(() => {
    pauseSyncRef.current = pauseSync;
    skipTasksRef.current = skipTasks;
  }, [pauseSync, skipTasks]);

  useEffect(() => {
    if (!enabled || !projectId) {
      return;
    }

    const pollProject = async () => {
      if (pauseSyncRef.current || document.hidden) {
        return;
      }

      try {
        const fresh = await getProject(projectId);
        setProject((current) =>
          mergeSyncedProject(current, fresh, { skipTasks: skipTasksRef.current }),
        );
      } catch {

      }
    };

    const intervalId = window.setInterval(pollProject, PROJECT_SYNC_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [enabled, projectId, setProject]);
}
