import React, {useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";

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
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            placeholder="New bucket name"
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={handleCreateBucket}
            className="ms-2"
          >
            Create
          </Button>
        </Form.Group>
      </Form>

      {/* List of Buckets */}
      {loading && buckets.length === 0 ? (
        <Spinner animation="border" variant="primary"/>
      ) : (
        buckets.map((bucket, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              cursor: "pointer",
              backgroundColor:
                selectedBucket === bucket ? "#e9ecef" : "white",
              borderRadius: "5px",
              marginBottom: "5px",
            }}
          >
            <span onClick={() => onBucketClick(bucket)}>{bucket}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeleteBucket(bucket)}
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default BucketList;