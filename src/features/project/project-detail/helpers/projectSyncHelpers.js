
export const mergeSyncedProject = (current, incoming, { skipTasks = false } = {}) => {
  if (!incoming) {
    return current;
  }

  if (!current) {
    return incoming;
  }

  return {
    ...current,
    ...incoming,
    _id: current._id ?? incoming._id,
    relatedFiles: incoming.relatedFiles ?? [],
    members: incoming.members ?? [],
    activityLogs: incoming.activityLogs ?? [],
    progressChecks: incoming.progressChecks ?? {},
    chatMessages: incoming.chatMessages ?? [],
    tasks: skipTasks ? current.tasks : (incoming.tasks ?? []),
    name: incoming.name,
    status: incoming.status,
    deadline: incoming.deadline,
    managerName: incoming.managerName,
    siteName: incoming.siteName,
    code: incoming.code,
    formNo: incoming.formNo,
    desc: incoming.desc,
  };
};
