

import { DownloadOutlined } from "@ant-design/icons";
import { Button, Col, Grid, Row, Space, Typography } from "antd";
import { exportProjectToExcel } from "@/features/project";

import { ProjectActivityLogsSection } from "./components/ActivityLogs/ProjectActivityLogsSection.jsx";
import { ProjectChatWidget } from "./components/Chat/ProjectChatWidget.jsx";
import { ProjectMembersSection } from "./components/Members/ProjectMembersSection.jsx";
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
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          align={isMobile ? "stretch" : "start"}
          style={{ width: "100%", justifyContent: "space-between" }}
          size="middle"
        >
          <div>
            <Title level={isMobile ? 3 : 2} style={{ marginBottom: 4, wordBreak: "break-word" }}>
              {project.name || "Chi tiết dự án"}
            </Title>
            <Text type="secondary">Thông tin và nhật ký công việc của dự án.</Text>
          </div>

          <div className={isMobile ? "mobile-stack-actions" : undefined}>
            <Space wrap style={{ width: isMobile ? "100%" : "auto" }}>
              {isAdmin && (
                <Button block={isMobile} onClick={openOverviewEditor}>
                  Cập nhật thông tin
                </Button>
              )}
              {canManageTasks && (
                <Button
                  block={isMobile}
                  icon={<DownloadOutlined />}
                  onClick={() => exportProjectToExcel(project, memberEmployees)}
                >
                  Xuất Excel
                </Button>
              )}
            </Space>
          </div>
        </Space>
      </div>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={10}>
          <ProjectOverviewSection />
        </Col>

        <Col xs={24} xl={14}>
          <ProjectMembersSection />
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
