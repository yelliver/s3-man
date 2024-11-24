import React from "react";
import { Table, Button } from "react-bootstrap";
import { FaFolder, FaFileAlt } from "react-icons/fa";

interface FileOrFolder {
    name: string;
    type: "file" | "folder";
    size?: string;
    lastModified?: string;
}

interface FileTableProps {
    filesAndFolders: FileOrFolder[];
    onFolderClick: (folderName: string) => void;
    onFileSelect: (fileName: string) => void;
}

const FileTable: React.FC<FileTableProps> = ({
    filesAndFolders,
    onFolderClick,
    onFileSelect,
}) => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filesAndFolders.map((item, index) => (
                    <tr
                        key={index}
                        style={{
                            cursor: item.type === "folder" ? "pointer" : "default",
                        }}
                        onClick={
                            item.type === "folder"
                                ? () => onFolderClick(item.name)
                                : undefined
                        }
                    >
                        <td>{index + 1}</td>
                        <td>
                            {item.type === "folder" ? (
                                <FaFolder style={{ color: "#ffc107" }} />
                            ) : (
                                <FaFileAlt style={{ color: "#6c757d" }} />
                            )}
                        </td>
                        <td>{item.name}</td>
                        <td>
                            {item.type === "file" && (
                                <Button
                                    variant="info"
                                    onClick={() => onFileSelect(item.name)}
                                >
                                    Select
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