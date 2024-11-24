import React, {useEffect, useState} from "react";
import {Button, Container, Navbar, Spinner} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable from "./components/FileTable";
import MetadataModal from "./components/MetadataModal";
import UploadModal from "./components/UploadModal";
import {
  createBucket,
  deleteBucket,
  downloadFile,
  fetchBuckets,
  fetchFilesAndFolders,
  uploadFile,
} from "./services/api";
import {FaArrowUp} from "react-icons/fa";

interface FileOrFolder {
  name: string;
  type: "file" | "folder";
  size?: string;
  lastModified?: string;
  metadata?: { key: string; value: string }[];
}

const App: React.FC = () => {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [path, setPath] = useState<string>(""); // Current folder path
  const [filesAndFolders, setFilesAndFolders] = useState<FileOrFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileOrFolder | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // Tracks selected files
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    loadBuckets();
  }, []);

  const loadBuckets = async () => {
    setLoading(true);
    try {
      const data = await fetchBuckets();
      setBuckets(data);
    } catch (error) {
      console.error("Error loading buckets:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleBucketClick = async (bucket: string) => {
    setSelectedBucket(bucket);
    setPath(""); // Reset to root path
    resetFileSelection();
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(bucket, "");
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error fetching files and folders:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folderName: string) => {
    const newPath = path ? `${path}${folderName}/` : `${folderName}/`;
    setPath(newPath);
    resetFileSelection();
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(selectedBucket, newPath);
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error fetching folder content:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoUp = async () => {
    if (!path) return;
    const newPath = path.slice(0, path.lastIndexOf("/", path.length - 2) + 1);
    setPath(newPath);
    resetFileSelection();
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(selectedBucket, newPath);
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error fetching parent folder content:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMetadata = (file: FileOrFolder) => {
    setSelectedFile(file);
    setShowMetadataModal(true);
  };

  const handleFileSelection = (fileName: string, isSelected: boolean) => {
    setSelectedFiles((prev) =>
      isSelected ? [...prev, fileName] : prev.filter((name) => name !== fileName)
    );
  };

  const handleUpload = async (file: File, metadata: Record<string, string>) => {
    try {
      await uploadFile(selectedBucket, path, file, metadata);
      handleBucketClick(selectedBucket); // Refresh files and folders
    } catch (error) {
      alert(`Failed to upload file: ${error instanceof Error ? error.message : error}`);
    } finally {
      setShowUploadModal(false);
    }
  };

  const handleDownload = async () => {
    if (selectedFiles.length !== 1) return;
    try {
      const blob = await downloadFile(selectedBucket, selectedFiles[0]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFiles[0];
      a.click();
    } catch (error) {
      alert(`Failed to download file: ${error instanceof Error ? error.message : error}`);
    }
  };

  const resetFileSelection = () => {
    setSelectedFiles([]);
  };

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#">S3 File Manager</Navbar.Brand>
        </Container>
      </Navbar>

      <div style={{flex: 1, display: "flex"}}>
        <BucketList
          buckets={buckets}
          selectedBucket={selectedBucket}
          loading={loading}
          onBucketClick={handleBucketClick}
          onCreateBucket={async (bucketName) => {
            try {
              await createBucket(bucketName);
              loadBuckets();
            } catch (error) {
              alert(`Failed to create bucket: ${error instanceof Error ? error.message : error}`);
            }
          }}
          onDeleteBucket={async (bucketName) => {
            try {
              await deleteBucket(bucketName);
              loadBuckets();
            } catch (error) {
              alert(`Failed to delete bucket: ${error instanceof Error ? error.message : error}`);
            }
          }}
        />

        <div style={{flex: 1, padding: "20px"}}>
          {selectedBucket ? (
            <>
              <h5>
                Files in <strong>{selectedBucket}</strong>/{path || ""}
              </h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Button
                    variant="secondary"
                    onClick={handleGoUp}
                    disabled={!path} // Disable if at root
                    className="me-2"
                  >
                    <FaArrowUp/> Go Up
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload File
                  </Button>
                </div>
              </div>
              {loading ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                  <Spinner animation="border" variant="primary"/>
                  <p>Loading...</p>
                </div>
              ) : (
                <FileTable
                  filesAndFolders={filesAndFolders}
                  onFolderClick={handleFolderClick}
                  onFileSelect={handleFileSelection}
                  onViewMetadata={handleViewMetadata}
                />
              )}
            </>
          ) : (
            <h5 className="text-center">Please select a bucket to view files</h5>
          )}
        </div>
      </div>

      {/* Metadata Modal */}
      {selectedFile && (
        <MetadataModal
          show={showMetadataModal}
          onClose={() => setShowMetadataModal(false)}
          metadata={selectedFile.metadata || []}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;