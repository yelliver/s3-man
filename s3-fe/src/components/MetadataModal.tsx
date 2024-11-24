import React from "react";
import {Button, Modal, Table} from "react-bootstrap";

interface MetadataModalProps {
  show: boolean;
  onClose: () => void;
  metadata: Record<string, string>; // Metadata is an object
}

const MetadataModal: React.FC<MetadataModalProps> = ({show, onClose, metadata}) => {
  const metadataEntries = Object.entries(metadata); // Convert metadata to an array of [key, value] pairs

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>File Metadata</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {metadataEntries.length > 0 ? ( // Check if there is any metadata
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            </thead>
            <tbody>
            {metadataEntries.map(([key, value], index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
            </tbody>
          </Table>
        ) : (
          <p>No metadata available for this file.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MetadataModal;