package com.example.s3be.controller;

import com.example.s3be.controller.model.FileMetadata;
import com.example.s3be.controller.model.FilesResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.HashMap;
import java.util.TreeMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
public class FileController {

  @Autowired
  private S3Client s3Client;

  @GetMapping
  public ResponseEntity<FilesResponse> listFiles(
    @RequestParam String bucket,
    @RequestParam(required = false, defaultValue = "") String path
  ) {
    try {
      var response = s3Client.listObjectsV2(ListObjectsV2Request.builder()
        .bucket(bucket)
        .prefix(path)
        .delimiter("/")
        .build());

      // Extract folders with metadata
      var folders = response.commonPrefixes()
        .stream()
        .map(prefix -> new FileMetadata(
          prefix.prefix().replace(path, ""),
          0,
          null,
          true,
          new TreeMap<>(),
          null
        ))
        .collect(Collectors.toList());

      // Extract files with metadata
      var files = response.contents()
        .stream()
        .filter(s3Object -> !s3Object.key().equals(path))
        .map(s3Object -> {
          var headResponse = s3Client.headObject(HeadObjectRequest.builder()
            .bucket(bucket)
            .key(s3Object.key())
            .build());

          return new FileMetadata(
            s3Object.key().replace(path, ""),
            s3Object.size(),
            s3Object.lastModified().toString(),
            false,
            headResponse.metadata(),
            headResponse.eTag()
          );
        })
        .collect(Collectors.toList());

      return ResponseEntity.ok(new FilesResponse(files, folders));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(null);
    }
  }

  @PostMapping("/upload")
  public ResponseEntity<String> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam String bucket,
    @RequestParam(required = false, defaultValue = "") String path,
    @RequestParam(required = false) Map<String, String> metadata
  ) {
    try {
      var finalMetadata = new TreeMap<String, String>();
      if (metadata != null) {
        finalMetadata.putAll(metadata);
      }
      finalMetadata.put("Content-Type", file.getContentType());

      var response = s3Client.putObject(
        PutObjectRequest.builder()
          .bucket(bucket)
          .key(path + file.getOriginalFilename())
          .metadata(finalMetadata)
          .build(),
        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
      );

      return ResponseEntity.ok()
        .body(String.format("File uploaded successfully: %s, ETag: %s",
          path + file.getOriginalFilename(),
          response.eTag()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Failed to upload file: " + e.getMessage());
    }
  }

  @GetMapping("/download")
  public ResponseEntity<byte[]> downloadFile(
    @RequestParam String bucket,
    @RequestParam String key,
    @RequestParam(required = false) String ifNoneMatch
  ) {
    try {
      var requestBuilder = GetObjectRequest.builder()
        .bucket(bucket)
        .key(key);

      if (ifNoneMatch != null && !ifNoneMatch.isEmpty()) {
        requestBuilder.ifNoneMatch(ifNoneMatch);
      }

      var response = s3Client.getObject(requestBuilder.build());
      var headers = new HttpHeaders();
      headers.add("ETag", response.response().eTag());
      response.response().metadata().forEach((k, v) -> headers.add(k, v));

      return ResponseEntity.ok()
        .headers(headers)
        .body(response.readAllBytes());
    } catch (S3Exception e) {
      if (e.statusCode() == 304) {
        return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }

  @DeleteMapping
  public ResponseEntity<String> deleteFile(
    @RequestParam String bucket,
    @RequestParam String key
  ) {
    try {
      s3Client.deleteObject(DeleteObjectRequest.builder()
        .bucket(bucket)
        .key(key)
        .build());

      return ResponseEntity.ok("File deleted successfully: " + key);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Failed to delete file: " + e.getMessage());
    }
  }
}