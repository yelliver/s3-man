import React, {useState} from "react";
import {Button, Container, Navbar} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BucketList from "./components/BucketList";
import FileTable from "./components/FileTable";
import MetadataModal from "./components/MetadataModal";
import UploadModal from "./components/UploadModal";
import {handleBucketClick, handleCreateBucket, handleDeleteBucket} from "./utils/bucketHandlers";
import {handleUpload} from "./utils/fileHandlers";
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
          onBucketClick={(bucket) =>
            handleBucketClick(bucket, {
              setSelectedBucket,
              setPath,
              refreshFiles,
              setLoading,
            })
          }
          onCreateBucket={(bucketName) =>
            handleCreateBucket(bucketName, {
              setBuckets,
            })
          }
          onDeleteBucket={(bucketName) =>
            handleDeleteBucket(bucketName, {
              setBuckets,
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
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const newPath = path.slice(0, path.lastIndexOf("/", path.length - 2) + 1);
                      setPath(newPath);
                      refreshFiles();
                    }}
                    disabled={!path} // Disable if at root
                    className="me-2"
                  >
                    <FaArrowUp/> Go Up
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleUpload(null, {}, {
                        selectedBucket,
                        path,
                        setShowUploadModal,
                        refreshFiles,
                        selectedFiles,
                      })
                    }
                  >
                    Upload File
                  </Button>
                </div>
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
                onViewMetadata={(file) => setSelectedFile(file)}
              />
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
        onUpload={(file, metadata) =>
          handleUpload(file, metadata, {
            selectedBucket,
            path,
            setShowUploadModal,
            refreshFiles,
            selectedFiles,
          })
        }
      />
    </div>
  );
};

export default App;