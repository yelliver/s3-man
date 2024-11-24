import React, { useEffect, useState } from "react";
import { Navbar, Container, Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable from "./components/FileTable";
import MetadataModal from "./components/MetadataModal";
import UploadModal from "./components/UploadModal";
import { fetchBuckets, fetchFilesAndFolders } from "./services/api";
import { FaArrowUp } from "react-icons/fa";

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
    setLoading(true);
    fetchBuckets()
      .then((data) => setBuckets(data))
      .catch((error) => console.error("Error fetching buckets:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleBucketClick = async (bucket: string) => {
    setSelectedBucket(bucket);
    setPath(""); // Reset to root path
    resetFileSelection();
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(bucket, "");
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error fetching files and folders:", error);
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
      console.error("Error fetching folder content:", error);
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
      console.error("Error fetching parent folder content:", error);
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

  const handleDownload = () => {
    if (selectedFiles.length === 1) {
      console.log("Downloading file:", selectedFiles[0]);
    }
  };

  const handleDownloadAsZip = () => {
    console.log("Downloading files as zip:", selectedFiles);
  };

  const handleUpload = (file: File, metadata: Record<string, string>) => {
    console.log("Uploading file:", file.name, "to path:", path);
    console.log("Metadata:", metadata);
    setShowUploadModal(false);
  };

  const resetFileSelection = () => {
    setSelectedFiles([]);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#">S3 File Manager</Navbar.Brand>
        </Container>
      </Navbar>

      <div style={{ flex: 1, display: "flex" }}>
        <BucketList
          buckets={buckets}
          selectedBucket={selectedBucket}
          loading={loading}
          onBucketClick={handleBucketClick}
        />

        <div style={{ flex: 1, padding: "20px" }}>
          <h5>
            {selectedBucket
              ? `Files in ${selectedBucket}/${path || ""}`
              : "Select a Bucket"}
          </h5>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button
                variant="secondary"
                onClick={handleGoUp}
                disabled={!path} // Disable if at root
                className="me-2"
              >
                <FaArrowUp /> Go Up
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload File
              </Button>
            </div>
            <div className="d-flex justify-content-end">
              {selectedFiles.length === 1 && (
                <Button
                  variant="success"
                  onClick={handleDownload}
                  className="me-2"
                >
                  Download File
                </Button>
              )}
              {selectedFiles.length > 0 && (
                <Button variant="info" onClick={handleDownloadAsZip}>
                  Download File(s) as Zip
                </Button>
              )}
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spinner animation="border" variant="primary" />
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
        </div>
      </div>

      {selectedFile && (
        <MetadataModal
          show={showMetadataModal}
          onClose={() => setShowMetadataModal(false)}
          metadata={selectedFile.metadata || []}
        />
      )}

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;