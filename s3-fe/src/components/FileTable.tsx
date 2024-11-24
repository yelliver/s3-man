import React from "react";
import { Table, Button } from "react-bootstrap";

export interface FileOrFolder {
  name: string;
  size: number;
  lastModified: string;
  metadata: Record<string, string>;
  etag: string;
  folder: boolean;
}

interface FileTableProps {
  filesAndFolders: FileOrFolder[];
  onFolderClick: (folderName: string) => void;
  onFileSelect: (fileName: string, isSelected: boolean) => void;
  onViewMetadata: (file: FileOrFolder) => void;
}

const FileTable: React.FC<FileTableProps> = ({
                                               filesAndFolders,
                                               onFolderClick,
                                               onFileSelect,
                                               onViewMetadata,
                                             }) => {
  const handleRowClick = (fileOrFolder: FileOrFolder) => {
    if (fileOrFolder.folder) {
      onFolderClick(fileOrFolder.name);
    }
  };

  return (
    <Table striped bordered hover>
      <thead>
      <tr>
        <th>Select</th>
        <th>Name</th>
        <th>Size</th>
        <th>Last Modified</th>
        <th>ETag</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      {filesAndFolders.map((fileOrFolder) => (
        <tr
          key={fileOrFolder.name}
          onClick={() => handleRowClick(fileOrFolder)}
          style={{ cursor: fileOrFolder.folder ? "pointer" : "default" }}
        >
          <td>
            {!fileOrFolder.folder && (
              <input
                type="checkbox"
                onChange={(e) => onFileSelect(fileOrFolder.name, e.target.checked)}
              />
            )}
          </td>
          <td>{fileOrFolder.name}</td>
          <td>{fileOrFolder.folder ? "-" : fileOrFolder.size}</td>
          <td>{fileOrFolder.folder ? "-" : fileOrFolder.lastModified}</td>
          <td>{fileOrFolder.folder ? "-" : fileOrFolder.etag}</td>
          <td>
            {!fileOrFolder.folder && (
              <Button
                variant="info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewMetadata(fileOrFolder);
                }}
              >
                Show Meta
              </Button>
            )}
          </td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
};

export default FileTable;