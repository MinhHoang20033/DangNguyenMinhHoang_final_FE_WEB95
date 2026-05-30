/** Public API for the project feature. */
export * from "./shared/index.js";
export * from "./utils/projectExport.js";
export {
  ProjectDetailProvider,
  useProjectDetailModel,
} from "./project-detail/ProjectDetailContext.jsx";
export { default as ProjectDetailView } from "./project-detail/ProjectDetailView.jsx";
export { useProjectDetail } from "./project-detail/hooks/useProjectDetail.jsx";
