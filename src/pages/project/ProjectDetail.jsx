import { useContext } from "react";
import { useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContextValue";
import {
  ProjectDetailProvider,
  ProjectDetailView,
  useProjectDetail,
} from "@/features/project";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const model = useProjectDetail(id, user);

  if (model.loading) {
    return <h2>Đang tải...</h2>;
  }

  if (model.loadError) {
    return <h2>{model.loadError}</h2>;
  }

  return (
    <ProjectDetailProvider value={model}>
      <ProjectDetailView />
    </ProjectDetailProvider>
  );
}
