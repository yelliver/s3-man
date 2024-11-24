package com.example.s3be.controller;

import com.example.s3be.controller.model.BucketRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buckets")
public class BucketController {

  @Autowired
  private S3Client s3Client;

  // List all buckets
  @GetMapping
  public ResponseEntity<List<String>> listBuckets() {
    try {
      ListBucketsResponse response = s3Client.listBuckets();
      List<String> bucketNames = response.buckets()
        .stream()
        .map(Bucket::name)
        .collect(Collectors.toList());
      return ResponseEntity.ok(bucketNames);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Collections.singletonList("Error retrieving bucket list: " + e.getMessage()));
    }
  }

  // Create a new bucket
  @PostMapping
  public ResponseEntity<String> createBucket(@RequestBody BucketRequest bucketRequest) {
    String bucketName = bucketRequest.getBucketName(); // Extract bucket name from request
    try {
      // Check if bucket already exists
      ListBucketsResponse listBucketsResponse = s3Client.listBuckets();
      boolean bucketExists = listBucketsResponse.buckets()
        .stream()
        .anyMatch(bucket -> bucket.name().equals(bucketName));

      if (bucketExists) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Bucket already exists: " + bucketName);
      }

      // Create bucket
      CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
        .bucket(bucketName)
        .build();
      s3Client.createBucket(createBucketRequest);

      return ResponseEntity.status(HttpStatus.CREATED).body("Bucket created successfully: " + bucketName);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating bucket: " + e.getMessage());
    }
  }

  // Delete a bucket
  @DeleteMapping("/{bucketName}")
  public ResponseEntity<String> deleteBucket(@RequestBody BucketRequest bucketRequest) {
    try {
      // Check if the bucket is empty
      ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
        .bucket(bucketRequest.getBucketName())
        .build();
      ListObjectsV2Response objectsResponse = s3Client.listObjectsV2(listObjectsRequest);

      if (!objectsResponse.contents().isEmpty()) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
          .body("Bucket is not empty. Delete all files before deleting the bucket.");
      }

      // Delete the bucket
      DeleteBucketRequest deleteBucketRequest = DeleteBucketRequest.builder()
        .bucket(bucketRequest.getBucketName())
        .build();
      s3Client.deleteBucket(deleteBucketRequest);

      return ResponseEntity.ok("Bucket deleted successfully: " + bucketRequest.getBucketName());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deleting bucket: " + e.getMessage());
    }
  }
}
