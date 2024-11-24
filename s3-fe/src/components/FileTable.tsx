import React from "react";
import {Button, Table} from "react-bootstrap";
import {FaInfoCircle, FaTrashAlt} from "react-icons/fa";

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
  onDeleteFile: (fileName: string) => void;
}

const FileTable: React.FC<FileTableProps> = ({
                                               filesAndFolders,
                                               onFolderClick,
                                               onFileSelect,
                                               onViewMetadata,
                                               onDeleteFile,
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
        <th>etag</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      {filesAndFolders.map((fileOrFolder) => (
        <tr
          key={fileOrFolder.name}
          onClick={() => handleRowClick(fileOrFolder)}
          style={{cursor: fileOrFolder.folder ? "pointer" : "default"}}
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
              <>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewMetadata(fileOrFolder);
                  }}
                >
                  <FaInfoCircle/>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(fileOrFolder.name);
                  }}
                >
                  <FaTrashAlt/>
                </Button>
              </>
            )}
          </td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
};

export default FileTable;