import React, {useEffect, useState} from "react";
import {Button, Container, Navbar, Spinner} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable from "./components/FileTable";
import UploadModal from "./components/UploadModal";
import {fetchBuckets, fetchFilesAndFolders} from "./services/api";

interface FileOrFolder {
  name: string;
  type: "file" | "folder";
  size?: string;
  lastModified?: string;
}

const App: React.FC = () => {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [path, setPath] = useState<string>(""); // Current folder path
  const [filesAndFolders, setFilesAndFolders] = useState<FileOrFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const handleUpload = (file: File, metadata: Record<string, string>) => {
    console.log("Uploading file:", file.name, "to path:", path);
    console.log("Metadata:", metadata);
    setShowUploadModal(false);
  };

  const handleDownload = () => {
    if (selectedFile) {
      console.log("Downloading file:", selectedFile);
    }
  };

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#">S3 File Manager</Navbar.Brand>
        </Container>
      </Navbar>

      <div style={{flex: 1, display: "flex"}}>
        {/* Bucket List (Sidebar) */}
        <BucketList
          buckets={buckets}
          selectedBucket={selectedBucket}
          loading={loading}
          onBucketClick={handleBucketClick}
        />

        {/* File Table */}
        <div style={{flex: 1, padding: "20px"}}>
          <h5>
            {selectedBucket
              ? `Files in ${selectedBucket}/${path || ""}`
              : "Select a Bucket"}
          </h5>
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="mb-3"
          >
            Upload File
          </Button>
          <Button
            variant="success"
            onClick={handleDownload}
            disabled={!selectedFile}
            className="mb-3 ms-2"
          >
            Download Selected File
          </Button>
          {loading ? (
            <div style={{textAlign: "center", padding: "20px"}}>
              <Spinner animation="border" variant="primary"/>
              <p>Loading...</p>
            </div>
          ) : (
            <FileTable
              filesAndFolders={filesAndFolders}
              onFolderClick={handleFolderClick}
              onFileSelect={(fileName) => setSelectedFile(fileName)}
            />
          )}
        </div>
      </div>

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