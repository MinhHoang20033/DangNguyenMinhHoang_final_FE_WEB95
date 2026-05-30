import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { exportProjectToExcel } from "@/features/project";

import { ProjectActivityLogsSection } from "./components/ActivityLogs/ProjectActivityLogsSection.jsx";
import { ProjectChatWidget } from "./components/Chat/ProjectChatWidget.jsx";
import { ProjectMemberAssignmentSection } from "./components/Members/ProjectMemberAssignmentSection.jsx";
import { OverviewEditorModal } from "./components/Overview/OverviewEditorModal.jsx";
import { ProjectOverviewSection } from "./components/Overview/ProjectOverviewSection.jsx";
import { FilePreviewModal } from "./components/Preview/FilePreviewModal.jsx";
import { PreviewSectionErrorBoundary } from "./components/Preview/PreviewSectionErrorBoundary.jsx";
import { ProjectProgressSection } from "./components/Progress/ProjectProgressSection.jsx";
import { ProjectRelatedFilesSection } from "./components/RelatedFiles/ProjectRelatedFilesSection.jsx";
import { ProjectTasksSection } from "./components/Task/ProjectTasksSection.jsx";
import { useProjectDetailModel } from "./ProjectDetailContext.jsx";

const { Title, Text } = Typography;

export default function ProjectDetailView() {
  const props = useProjectDetailModel();
  const {
    isAdmin,
    project,
    saving,
    overviewOpen,
    setOverviewOpen,
    memberEmployees,
    overviewDraft,
    setOverviewDraft,
    previewState,
    canManageTasks,
    closePreview,
    handleExcelSheetChange,
    activeExcelRows,
    submitOverviewUpdate,
    openOverviewEditor,
  } = props;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={2} style={{ marginBottom: 4 }}>
              {project.name || "Chi tiết dự án"}
            </Title>
            <Text type="secondary">Thông tin và nhật ký công việc của dự án.</Text>
          </div>

          <Space>
            {isAdmin && <Button onClick={openOverviewEditor}>Cập nhật thông tin</Button>}
            {canManageTasks && (
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportProjectToExcel(project, memberEmployees)}
              >
                Xuất Excel
              </Button>
            )}
          </Space>
        </Space>
      </div>

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} xl={10}>
          <ProjectOverviewSection />
        </Col>

        <Col xs={24} xl={14}>
          <Card title="Phân công nhân sự" style={{ height: "100%" }}>
            <ProjectMemberAssignmentSection />
          </Card>
        </Col>
      </Row>

      <PreviewSectionErrorBoundary>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <ProjectRelatedFilesSection />
          <ProjectTasksSection />
          <ProjectProgressSection />
        </Space>

        <FilePreviewModal
          previewState={previewState}
          activeExcelRows={activeExcelRows}
          onClose={closePreview}
          onExcelSheetChange={handleExcelSheetChange}
        />
      </PreviewSectionErrorBoundary>

      <ProjectActivityLogsSection />

      {isAdmin && (
        <OverviewEditorModal
          open={overviewOpen}
          saving={saving}
          overviewDraft={overviewDraft}
          onDraftChange={(patch) => setOverviewDraft((current) => ({ ...current, ...patch }))}
          onCancel={() => setOverviewOpen(false)}
          onSubmit={submitOverviewUpdate}
        />
      )}

      <ProjectChatWidget />
    </Space>
  );
}
