import React, {useEffect, useState} from "react";
import {Button, Container, Navbar} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable, {FileOrFolder} from "./components/FileTable";
import MetadataModal from "./components/MetadataModal";
import UploadModal from "./components/UploadModal";
import {FaArrowUp} from "react-icons/fa";
import {createBucket, deleteBucket, downloadFile, fetchBuckets, fetchFilesAndFolders, uploadFile} from "./services/api";

const App: React.FC = () => {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [path, setPath] = useState<string>(""); // Current folder path
  const [filesAndFolders, setFilesAndFolders] = useState<FileOrFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileOrFolder | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // Tracks selected files
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false); // Controls the upload modal visibility

  // Load buckets when the app initializes
  useEffect(() => {
    const initializeBuckets = async () => {
      setLoading(true);
      try {
        const bucketList = await fetchBuckets();
        setBuckets(bucketList);
      } catch (error) {
        console.error("Error loading buckets:", error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    };

    initializeBuckets();
  }, []);

  // Refresh files for the selected bucket and path
  const refreshFiles = async () => {
    if (!selectedBucket) return;
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(selectedBucket, path);
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error refreshing files:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bucket click
  const handleBucketClick = async (bucket: string) => {
    setSelectedBucket(bucket);
    setPath(""); // Reset to root path
    setSelectedFiles([]);
    setLoading(true);
    try {
      await refreshFiles();
    } catch (error) {
      console.error("Error loading bucket files:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bucket creation
  const handleCreateBucket = async (bucketName: string) => {
    try {
      await createBucket(bucketName);
      const bucketList = await fetchBuckets();
      setBuckets(bucketList);
    } catch (error) {
      alert(`Failed to create bucket: ${error instanceof Error ? error.message : error}`);
    }
  };

  // Handle bucket deletion
  const handleDeleteBucket = async (bucketName: string) => {
    if (!window.confirm(`Are you sure you want to delete the bucket: ${bucketName}?`)) return;
    try {
      await deleteBucket(bucketName);
      const bucketList = await fetchBuckets();
      setBuckets(bucketList);
    } catch (error) {
      alert(`Failed to delete bucket: ${error instanceof Error ? error.message : error}`);
    }
  };

  // Handle file upload
  const handleUpload = async (file: File | null, metadata: Record<string, string>) => {
    if (!file) {
      alert("No file selected for upload.");
      return;
    }

    try {
      await uploadFile(selectedBucket, path, file, metadata);
      await refreshFiles();
    } catch (error) {
      alert(`Failed to upload file: ${error instanceof Error ? error.message : error}`);
    } finally {
      setShowUploadModal(false);
    }
  };

  // Handle file download
  const handleDownload = async () => {
    if (selectedFiles.length !== 1) {
      alert("Please select exactly one file to download.");
      return;
    }

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

  // Handle "Go Up" action
  const handleGoUp = () => {
    const newPath = path.slice(0, path.lastIndexOf("/", path.length - 2) + 1);
    setPath(newPath);
    refreshFiles();
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
          onCreateBucket={handleCreateBucket}
          onDeleteBucket={handleDeleteBucket}
        />

        <div style={{flex: 1, padding: "20px"}}>
          {selectedBucket ? (
            <>
              <h5>
                Files in <strong>{selectedBucket}</strong>/{path || ""}
              </h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="secondary" onClick={handleGoUp} disabled={!path} className="me-2">
                  <FaArrowUp/> Go Up
                </Button>
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                  Upload File
                </Button>
              </div>
              <FileTable
                filesAndFolders={filesAndFolders}
                onFolderClick={(folderName) => {
                  const newPath = path ? `${path}${folderName}/` : `${folderName}/`;
                  setPath(newPath);
                  refreshFiles();
                }}
                onFileSelect={(fileName, isSelected) =>
                  setSelectedFiles((prev) =>
                    isSelected ? [...prev, fileName] : prev.filter((name) => name !== fileName)
                  )
                }
                onViewMetadata={(file) => {
                  setSelectedFile(file);
                  setShowMetadataModal(true);
                }}
              />
            </>
          ) : (
            <h5 className="text-center">Please select a bucket to view files</h5>
          )}
        </div>
      </div>

      <MetadataModal
        show={showMetadataModal}
        onClose={() => {
          setShowMetadataModal(false);
          setSelectedFile(null);
        }}
        metadata={selectedFile?.metadata || {}}
      />

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;