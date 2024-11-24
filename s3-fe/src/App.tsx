import React, {useEffect, useState} from "react";
import {Button, Container, Form, Navbar} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable, {FileOrFolder} from "./components/FileTable";
import MetadataModal from "./components/MetadataModal";
import UploadModal from "./components/UploadModal";
import {FaArrowUp} from "react-icons/fa";
import {
  createBucket,
  createFolder,
  deleteBucket,
  deleteFile,
  downloadFile,
  downloadZip,
  fetchBuckets,
  fetchFilesAndFolders,
  uploadFile,
} from "./services/api";

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
  const [newFolderName, setNewFolderName] = useState<string>(""); // For folder creation

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

  const refreshFiles = async (bucket: string, currentPath: string = "") => {
    if (!bucket) return;
    setLoading(true);
    try {
      const data = await fetchFilesAndFolders(bucket, currentPath);
      setFilesAndFolders(data);
    } catch (error) {
      console.error("Error refreshing files:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (zip: boolean) => {
    if (selectedFiles.length === 0) {
      alert("No files selected for download.");
      return;
    }
    if (zip) {
      const fileKeys = selectedFiles.map((fileName) => `${path}${fileName}`);
      await downloadZip(selectedBucket, fileKeys); // Open ZIP download
    } else {
      const fileKey = `${path}${selectedFiles[0]}`;
      await downloadFile(selectedBucket, fileKey); // Open single file download
    }
  };

  const handleBucketClick = async (bucket: string) => {
    setSelectedBucket(bucket);
    setPath(""); // Reset to root path
    setSelectedFiles([]);
    await refreshFiles(bucket, ""); // Fetch root files for the selected bucket
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty.");
      return;
    }
    try {
      await createFolder(selectedBucket, `${path}${newFolderName}/`);
      setNewFolderName(""); // Clear the textbox
      await refreshFiles(selectedBucket, path); // Refresh files
    } catch (error) {
      alert(`Failed to create folder: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete the file: ${fileName}?`)) return;

    try {
      await deleteFile(selectedBucket, path, fileName); // Provide bucket and path
      await refreshFiles(selectedBucket, path); // Refresh the file list after deletion
    } catch (error) {
      alert(`Failed to delete file: ${error instanceof Error ? error.message : error}`);
    }
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
          onCreateBucket={(bucketName) =>
            createBucket(bucketName).then(() => {
              setBuckets([...buckets, bucketName]);
            })
          }
          onDeleteBucket={(bucketName) =>
            deleteBucket(bucketName).then(() => {
              setBuckets(buckets.filter((b) => b !== bucketName));
            })
          }
        />

        <div style={{flex: 1, padding: "20px"}}>
          {selectedBucket ? (
            <>
              <h5>
                Files in <strong>{selectedBucket}</strong>/{path || ""}
              </h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const newPath = path.slice(0, path.lastIndexOf("/", path.length - 2) + 1);
                    setPath(newPath);
                    refreshFiles(selectedBucket, newPath);
                  }}
                  disabled={!path}
                  className="me-2"
                >
                  <FaArrowUp/> Go Up
                </Button>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="me-2"
                  />
                  <Button variant="success" onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
                <Button variant="primary" onClick={() => setShowUploadModal(true)} className="ms-3">
                  Upload File
                </Button>
              </div>
              <FileTable
                filesAndFolders={filesAndFolders}
                onFolderClick={(folderName) => {
                  const newPath = path ? `${path}${folderName}` : `${folderName}`;
                  setPath(newPath);
                  refreshFiles(selectedBucket, newPath);
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
                onDeleteFile={handleDeleteFile} // Pass delete handler
              />
              {selectedFiles.length > 0 && (
                <div style={{marginTop: "20px"}}>
                  {selectedFiles.length === 1 && (
                    <Button variant="primary" onClick={() => handleDownload(false)}>
                      Download
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => handleDownload(true)}>
                    Download Zip
                  </Button>
                </div>
              )}
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
        onUpload={(file, metadata) =>
          uploadFile(selectedBucket, path, file, metadata).then(() => refreshFiles(selectedBucket, path))
        }
      />
    </div>
  );
};

export default App;