import React from "react";
import {Spinner} from "react-bootstrap";

interface BucketListProps {
  buckets: string[];
  selectedBucket: string;
  loading: boolean;
  onBucketClick: (bucket: string) => void;
}

const BucketList: React.FC<BucketListProps> = ({
                                                 buckets,
                                                 selectedBucket,
                                                 loading,
                                                 onBucketClick,
                                               }) => {
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
      {loading && buckets.length === 0 ? (
        <Spinner animation="border" variant="primary"/>
      ) : (
        buckets.map((bucket, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              cursor: "pointer",
              backgroundColor:
                selectedBucket === bucket ? "#e9ecef" : "white",
              borderRadius: "5px",
              marginBottom: "5px",
            }}
            onClick={() => onBucketClick(bucket)}
          >
            {bucket}
          </div>
        ))
      )}
    </div>
  );
};

export default BucketList;