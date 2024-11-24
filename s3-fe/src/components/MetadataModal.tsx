import React, {useState} from "react";
import {Button, Col, Form, Modal, Row, Table} from "react-bootstrap";

interface MetadataModalProps {
  show: boolean;
  onClose: () => void;
  metadata: { key: string; value: string }[];
  onSaveMetadata: (newMetadata: { key: string; value: string }[]) => void;
}

const MetadataModal: React.FC<MetadataModalProps> = ({
                                                       show,
                                                       onClose,
                                                       metadata,
                                                       onSaveMetadata,
                                                     }) => {
  const [currentMetadata, setCurrentMetadata] = useState<{ key: string; value: string }[]>(
    metadata
  );
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddMetadata = () => {
    if (newKey.trim() && newValue.trim()) {
      setCurrentMetadata((prev) => [...prev, {key: newKey.trim(), value: newValue.trim()}]);
      setNewKey("");
      setNewValue("");
    }
  };

  const handleDeleteMetadata = (index: number) => {
    setCurrentMetadata((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveMetadata(currentMetadata);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>File Metadata</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Metadata</h6>
        {currentMetadata.length > 0 ? (
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {currentMetadata.map((item, index) => (
              <tr key={index}>
                <td>{item.key}</td>
                <td>{item.value}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMetadata(index)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        ) : (
          <p>No metadata available for this file.</p>
        )}

        <h6>Add Metadata</h6>
        <Row className="mb-3">
          <Col>
            <Form.Control
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </Col>
          <Col>
            <Form.Control
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={handleAddMetadata}>Add</Button>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MetadataModal;