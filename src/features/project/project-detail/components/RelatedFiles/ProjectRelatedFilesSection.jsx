import { DownloadOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space, Typography } from "antd";

import { formatDateTime, formatFileSize, getFileIcon, getFileTypeLabel } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

export function ProjectRelatedFilesSection() {
  const {
    saving,
    canManageTasks,
    triggerFilePicker,
    fileInputRef,
    handleProjectFileUpload,
    relatedFiles,
    openFilePreview,
    handleDownloadFile,
    isAdmin,
    handleDeleteProjectFile,
  } = useProjectDetailModel();

  return (
    <Card
      title="Tệp liên quan dự án"
      extra={
        canManageTasks ? (
          <Button icon={<UploadOutlined />} onClick={triggerFilePicker} loading={saving}>
            Tải tệp lên
          </Button>
        ) : null
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xls,.xlsx,.csv,.doc,.docx"
        style={{ display: "none" }}
        onChange={handleProjectFileUpload}
      />

      {relatedFiles.length ? (
        <div style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: 16, width: "max-content" }}>
            {relatedFiles.map((file) => (
              <Card
                key={file.id}
                size="small"
                style={{ width: 280, minWidth: 280, borderRadius: 14, flex: "0 0 auto" }}
                bodyStyle={{ padding: 16 }}
              >
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Space>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{getFileIcon(file)}</span>
                    <div>
                      <Text strong>{file.name || file.originalName || "Tệp đính kèm"}</Text>
                      <div>
                        <Text type="secondary">
                          {getFileTypeLabel(file)} • {formatFileSize(file.size)}
                        </Text>
                      </div>
                    </div>
                  </Space>
                  <div>
                    <Text type="secondary">{formatDateTime(file.uploadedAt)}</Text>
                  </div>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Button block icon={<EyeOutlined />} onClick={() => openFilePreview(file)}>
                      Xem trước
                    </Button>
                    <Button block icon={<DownloadOutlined />} onClick={() => handleDownloadFile(file)}>
                      Tải tệp
                    </Button>
                    {isAdmin && (
                      <Button block danger onClick={() => handleDeleteProjectFile(file.id)} loading={saving}>
                        Xóa
                      </Button>
                    )}
                  </Space>
                </Space>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Empty description="Chưa có tệp liên quan" />
      )}
    </Card>
  );
}
