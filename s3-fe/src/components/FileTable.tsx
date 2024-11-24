import React from "react";
import {Button, Table} from "react-bootstrap";
import {FaFileAlt, FaFolder} from "react-icons/fa";

interface FileOrFolder {
  name: string;
  type: "file" | "folder";
  size?: string;
  lastModified?: string;
  metadata?: { key: string; value: string }[];
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
  return (
    <Table striped bordered hover>
      <thead>
      <tr>
        <th>#</th>
        <th>Type</th>
        <th>Name</th>
        <th>Actions</th>
        <th>Select</th>
      </tr>
      </thead>
      <tbody>
      {filesAndFolders.map((item, index) => (
        <tr
          key={index}
          style={{
            cursor: item.type === "folder" || item.type === "file" ? "pointer" : "default",
          }}
          onClick={(e) => {
            // Prevent metadata button click from toggling checkbox
            if ((e.target as HTMLElement).tagName === "BUTTON") return;

            // Handle folder click
            if (item.type === "folder") {
              onFolderClick(item.name);
              return;
            }

            // Handle file row click (toggle checkbox)
            const checkbox = document.getElementById(
              `checkbox-${item.name}`
            ) as HTMLInputElement;

            if (checkbox) {
              checkbox.checked = !checkbox.checked;
              onFileSelect(item.name, checkbox.checked);
            }
          }}
        >
          <td>{index + 1}</td>
          <td>
            {item.type === "folder" ? (
              <FaFolder style={{color: "#ffc107"}}/>
            ) : (
              <FaFileAlt style={{color: "#6c757d"}}/>
            )}
          </td>
          <td>{item.name}</td>
          <td>
            {item.type === "file" && (
              <Button
                variant="info"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                  onViewMetadata(item);
                }}
              >
                View Metadata
              </Button>
            )}
          </td>
          <td>
            {item.type === "file" && (
              <div className="form-check">
                <input
                  id={`checkbox-${item.name}`}
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) =>
                    onFileSelect(item.name, e.target.checked)
                  }
                />
              </div>
            )}
          </td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
};

export default FileTable;