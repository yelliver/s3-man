import React, { useState } from "react";
import { Button, ListGroup, Form, Spinner } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";

interface BucketListProps {
  buckets: string[];
  selectedBucket: string;
  loading: boolean;
  onBucketClick: (bucket: string) => void;
  onCreateBucket: (bucketName: string) => void;
  onDeleteBucket: (bucketName: string) => void;
}

const BucketList: React.FC<BucketListProps> = ({
                                                 buckets,
                                                 selectedBucket,
                                                 loading,
                                                 onBucketClick,
                                                 onCreateBucket,
                                                 onDeleteBucket,
                                               }) => {
  const [newBucketName, setNewBucketName] = useState("");

  const handleCreateBucket = () => {
    if (newBucketName.trim() === "") {
      alert("Bucket name cannot be empty.");
      return;
    }
    onCreateBucket(newBucketName.trim());
    setNewBucketName(""); // Clear the input field
  };

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #ddd",
        padding: "20px",
        height: "100%",
      }}
    >
      <h5>Buckets</h5>

      {/* Create Bucket Section */}
      <Form className="mb-3">
        <Form.Group className="d-flex align-items-center">
          <Form.Control
            type="text"
            placeholder="New bucket name"
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={handleCreateBucket}
            className="ms-2 d-flex align-items-center justify-content-center"
            style={{ height: "38px", width: "38px" }}
          >
            <FaPlus />
          </Button>
        </Form.Group>
      </Form>

      {/* Bucket List */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <ListGroup>
          {buckets.map((bucket, index) => (
            <ListGroup.Item
              key={index}
              onClick={() => onBucketClick(bucket)}
              className={`d-flex justify-content-between align-items-center ${
                selectedBucket === bucket ? "active" : ""
              }`}
              style={{
                cursor: "pointer",
              }}
            >
              <span>{bucket}</span>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the onClick of ListGroup.Item
                  onDeleteBucket(bucket);
                }}
                className="d-flex align-items-center justify-content-center"
                style={{ height: "38px", width: "38px" }}
              >
                <FaTrash />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default BucketList;