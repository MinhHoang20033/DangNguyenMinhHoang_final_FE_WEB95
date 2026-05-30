import { createContext, useContext } from "react";

const ProjectDetailContext = createContext(null);

export function ProjectDetailProvider({ value, children }) {
  return <ProjectDetailContext.Provider value={value}>{children}</ProjectDetailContext.Provider>;
}
export function useProjectDetailModel() {
  const context = useContext(ProjectDetailContext);
  if (!context) {
    throw new Error("useProjectDetailModel must be used within a ProjectDetailProvider");
  }
  return context;
}

