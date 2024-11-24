package com.example.s3be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteBucketRequest;

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
    var bucketNames = s3Client.listBuckets().buckets()
      .stream()
      .map(bucket -> bucket.name())
      .collect(Collectors.toList());
    return ResponseEntity.status(HttpStatus.OK).body(bucketNames);
  }

  // Create a new bucket
  @PostMapping("/{bucketName}")
  public ResponseEntity<String> createBucket(@PathVariable String bucketName) {
    if (s3Client.listBuckets().buckets().stream()
      .anyMatch(bucket -> bucket.name().equals(bucketName))) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body("Bucket already exists: " + bucketName);
    }
    s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
    return ResponseEntity.status(HttpStatus.CREATED).body("Bucket created successfully: " + bucketName);
  }

  // Delete a bucket
  @DeleteMapping("/{bucketName}")
  public ResponseEntity<String> deleteBucket(@PathVariable String bucketName) {
    if (s3Client.listBuckets().buckets().stream()
      .noneMatch(bucket -> bucket.name().equals(bucketName))) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bucket not found: " + bucketName);
    }
    s3Client.deleteBucket(DeleteBucketRequest.builder().bucket(bucketName).build());
    return ResponseEntity.status(HttpStatus.OK).body("Bucket deleted successfully: " + bucketName);
  }
}
