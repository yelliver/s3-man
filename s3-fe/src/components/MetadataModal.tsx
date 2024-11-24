import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

interface MetadataModalProps {
  show: boolean;
  onClose: () => void;
  metadata: { key: string; value: string }[];
}

const MetadataModal: React.FC<MetadataModalProps> = ({ show, onClose, metadata }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>File Metadata</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {metadata.length > 0 ? (
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            </thead>
            <tbody>
            {metadata.map((item, index) => (
              <tr key={index}>
                <td>{item.key}</td>
                <td>{item.value}</td>
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