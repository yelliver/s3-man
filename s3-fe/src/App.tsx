import React, {useEffect, useState} from "react";
import {Container, Navbar} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import {
  createBucket,
  deleteBucket,
  downloadFile,
  fetchBuckets,
  fetchFilesAndFolders,
  uploadFile,
} from "./services/api";

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
      console.error("Error loading buckets:", error);
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
      console.error("Error fetching files and folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async (bucketName: string) => {
    try {
      await createBucket(bucketName);
      loadBuckets();
    } catch (error) {
      alert(`Failed to create bucket: ${error}`);
    }
  };

  const handleDeleteBucket = async (bucketName: string) => {
    if (!window.confirm(`Are you sure you want to delete the bucket: ${bucketName}?`)) {
      return;
    }
    try {
      await deleteBucket(bucketName);
      loadBuckets();
    } catch (error) {
      alert(`Failed to delete bucket: ${error}`);
    }
  };

  const handleUpload = async (file: File, metadata: Record<string, string>) => {
    try {
      await uploadFile(selectedBucket, path, file, metadata);
      handleBucketClick(selectedBucket); // Refresh files and folders
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
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
      alert(`Failed to download file: ${error}`);
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
          onCreateBucket={handleCreateBucket}
          onDeleteBucket={handleDeleteBucket}
        />

        {/* Rest of the UI Components */}
      </div>
    </div>
  );
};

export default App;