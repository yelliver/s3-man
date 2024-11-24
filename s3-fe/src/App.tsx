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
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // Tracks selected files

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
      setSelectedFiles([]); // Clear selected files when navigating
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
      setSelectedFiles([]); // Clear selected files when navigating
    } catch (error) {
      console.error("Error fetching folder content:", error);
    } finally {
      setLoading(false);
    }
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Left-aligned Upload Button */}
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
            >
              Upload File
            </Button>

            {/* Right-aligned Download Buttons */}
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
            <div style={{textAlign: "center", padding: "20px"}}>
              <Spinner animation="border" variant="primary"/>
              <p>Loading...</p>
            </div>
          ) : (
            <FileTable
              filesAndFolders={filesAndFolders}
              onFolderClick={handleFolderClick}
              onFileSelect={handleFileSelection} // This now matches the updated type
            />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file, metadata) => {
          console.log("Uploading file:", file.name, "to path:", path);
          console.log("Metadata:", metadata);
          setShowUploadModal(false);
        }}
      />
    </div>
  );
};

export default App;