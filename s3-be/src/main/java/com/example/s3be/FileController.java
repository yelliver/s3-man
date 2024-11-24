package com.example.s3be;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
public class FileController {

  @Autowired
  private S3Client s3Client;

  @Value("${aws.s3.bucketName:}")
  private String bucketName;

  //list bucket
  @GetMapping("/buckets")
  public List<String> listBucket() {
    ListBucketsResponse response = s3Client.listBuckets();
    return response.buckets()
      .stream()
      .map(Bucket::name)
      .collect(Collectors.toList());
  }

  // List files
  @GetMapping
  public List<String> listFiles() {
    ListObjectsV2Request request = ListObjectsV2Request.builder()
      .bucket(bucketName)
      .build();

    ListObjectsV2Response response = s3Client.listObjectsV2(request);
    return response.contents()
      .stream()
      .map(S3Object::key)
      .collect(Collectors.toList());
  }

  // Upload file
  @PostMapping("/upload")
  public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
    try {
      s3Client.putObject(
        PutObjectRequest.builder()
          .bucket(bucketName)
          .key(file.getOriginalFilename())
          .build(),
        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
      );
      return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file: " + e.getMessage());
    }
  }

  // Download file
  @GetMapping("/download/{fileName}")
  public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
    try {
      GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .build();

      byte[] content = s3Client.getObject(getObjectRequest).readAllBytes();
      return ResponseEntity.ok(content);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
  }

  // Delete file
  @DeleteMapping("/{fileName}")
  public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
    try {
      DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .build();

      s3Client.deleteObject(deleteObjectRequest);
      return ResponseEntity.ok("File deleted successfully: " + fileName);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete file: " + e.getMessage());
    }
  }
}