import React, {useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: Record<string, string>) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({show, onClose, onUpload}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>([]);

  const handleAddMetadata = () => {
    setMetadata((prev) => [...prev, {key: "", value: ""}]);
  };

  const handleMetadataChange = (
    index: number,
    keyOrValue: "key" | "value",
    value: string
  ) => {
    setMetadata((prev) =>
      prev.map((item, i) =>
        i === index ? {...item, [keyOrValue]: value} : item
      )
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const metadataObject = metadata.reduce<Record<string, string>>(
        (acc, {key, value}) => {
          if (key && value) acc[key] = value;
          return acc;
        },
        {}
      );
      onUpload(file, metadataObject);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Upload File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="fileUpload" className="mb-3">
            <Form.Label>Select File</Form.Label>
            <Form.Control type="file" onChange={handleFileChange}/>
          </Form.Group>
          <h6>Metadata</h6>
          {metadata.map((item, index) => (
            <Row key={index} className="mb-2">
              <Col>
                <Form.Control
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) =>
                    handleMetadataChange(index, "key", e.target.value)
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    handleMetadataChange(index, "value", e.target.value)
                  }
                />
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={handleAddMetadata}>
            Add Metadata
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadModal;