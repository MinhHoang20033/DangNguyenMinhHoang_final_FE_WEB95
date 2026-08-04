import { DownloadOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Grid, Row, Space, Typography } from "antd";

import { formatDateTime, formatFileSize, getFileIcon, getFileTypeLabel } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  SECTION_SCROLL,
  createScrollBoxStyle,
  sectionCardStyle,
  sectionCardStyles,
  softItemCardStyle,
} from "../../helpers/sectionStyles.js";

const { Text, Title } = Typography;

export function ProjectRelatedFilesSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const {
    canManageTasks,
    triggerFilePicker,
    fileInputRef,
    handleProjectFileUpload,
    relatedFiles,
    openFilePreview,
    handleDownloadFile,
    isAdmin,
    handleDeleteProjectFile,
    uploadingFiles,
    deletingFileId,
  } = useProjectDetailModel();

  return (
    <Card
      title={
        <div>
          <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
            Tệp liên quan dự án
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {relatedFiles.length} tệp đính kèm
          </Text>
        </div>
      }
      extra={
        !isMobile && canManageTasks ? (
          <Button icon={<UploadOutlined />} type="primary" onClick={triggerFilePicker} loading={uploadingFiles}>
            Tải tệp lên
          </Button>
        ) : null
      }
      style={sectionCardStyle}
      styles={sectionCardStyles}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xls,.xlsx,.csv,.doc,.docx"
        style={{ display: "none" }}
        onChange={handleProjectFileUpload}
      />

      {isMobile && canManageTasks && (
        <Button
          icon={<UploadOutlined />}
          type="primary"
          block
          onClick={triggerFilePicker}
          loading={uploadingFiles}
          style={{ marginBottom: 14 }}
        >
          Tải tệp lên
        </Button>
      )}

      {relatedFiles.length ? (
        <div style={createScrollBoxStyle(SECTION_SCROLL.files)}>
          <Row gutter={[12, 12]}>
            {relatedFiles.map((file) => (
              <Col xs={24} sm={12} xl={8} key={file.id}>
                <Card size="small" style={{ ...softItemCardStyle, height: "100%" }} styles={{ body: { padding: 16 } }}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space align="start">
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: "#eff6ff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        {getFileIcon(file)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Text strong style={{ wordBreak: "break-word", display: "block" }}>
                          {file.name || file.originalName || "Tệp đính kèm"}
                        </Text>
                        <Text type="secondary">
                          {getFileTypeLabel(file)} • {formatFileSize(file.size)}
                        </Text>
                      </div>
                    </Space>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(file.uploadedAt)}
                    </Text>

                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <Button block icon={<EyeOutlined />} onClick={() => openFilePreview(file)}>
                        Xem trước
                      </Button>
                      <Button block icon={<DownloadOutlined />} onClick={() => handleDownloadFile(file)}>
                        Tải tệp
                      </Button>
                      {isAdmin && (
                        <Button
                          block
                          danger
                          onClick={() => handleDeleteProjectFile(file.id)}
                          loading={deletingFileId === file.id}
                          disabled={Boolean(uploadingFiles || deletingFileId)}
                        >
                          Xóa
                        </Button>
                      )}
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Empty description="Chưa có tệp liên quan" />
      )}
    </Card>
  );
}
