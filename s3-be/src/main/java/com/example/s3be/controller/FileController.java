package com.example.s3be.controller;

import com.example.s3be.controller.model.FileMetadata;
import com.example.s3be.controller.model.FilesResponse;
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
  private String defaultBucketName;

  // List files and folders in a specific path
  @GetMapping
  public ResponseEntity<FilesResponse> listFiles(
    @RequestParam(required = false, defaultValue = "") String bucketName,
    @RequestParam(required = false, defaultValue = "") String path
  ) {
    try {
      String effectiveBucketName = bucketName.isEmpty() ? defaultBucketName : bucketName;

      ListObjectsV2Request request = ListObjectsV2Request.builder()
        .bucket(effectiveBucketName)
        .prefix(path)
        .delimiter("/")
        .build();

      ListObjectsV2Response response = s3Client.listObjectsV2(request);

      // Extract folders
      List<FileMetadata> folders = response.commonPrefixes()
        .stream()
        .map(prefix -> new FileMetadata(
          prefix.prefix().replace(path, ""), // Folder name
          0,                        // Size for folders is 0
          null,                     // No lastModified for folders
          true                      // Mark as folder
        ))
        .collect(Collectors.toList());

      // Extract files
      List<FileMetadata> files = response.contents()
        .stream()
        .filter(s3Object -> !s3Object.key().equals(path)) // Exclude the folder itself
        .map(s3Object -> new FileMetadata(
          s3Object.key().replace(path, ""), // File name
          s3Object.size(),                  // File size
          s3Object.lastModified().toString(), // Last modified
          false                             // Mark as file
        ))
        .collect(Collectors.toList());

      return ResponseEntity.ok(new FilesResponse(files, folders));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(null);
    }
  }

  // Upload a file to a specific path
  @PostMapping("/upload")
  public ResponseEntity<String> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam(required = false, defaultValue = "") String bucketName,
    @RequestParam(required = false, defaultValue = "") String path
  ) {
    try {
      String effectiveBucketName = bucketName.isEmpty() ? defaultBucketName : bucketName;
      String key = path + file.getOriginalFilename();

      s3Client.putObject(
        PutObjectRequest.builder()
          .bucket(effectiveBucketName)
          .key(key)
          .build(),
        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
      );

      return ResponseEntity.ok("File uploaded successfully: " + key);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file: " + e.getMessage());
    }
  }

  // Download a file
  @GetMapping("/download")
  public ResponseEntity<byte[]> downloadFile(
    @RequestParam String bucketName,
    @RequestParam String key
  ) {
    try {
      GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .build();

      byte[] content = s3Client.getObject(getObjectRequest).readAllBytes();
      return ResponseEntity.ok(content);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
  }

  // Delete a file
  @DeleteMapping
  public ResponseEntity<String> deleteFile(
    @RequestParam String bucketName,
    @RequestParam String key
  ) {
    try {
      DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .build();

      s3Client.deleteObject(deleteObjectRequest);
      return ResponseEntity.ok("File deleted successfully: " + key);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete file: " + e.getMessage());
    }
  }
}