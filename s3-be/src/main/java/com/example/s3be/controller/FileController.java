package com.example.s3be.controller;

import com.example.s3be.controller.model.FileOrFolder;
import com.example.s3be.controller.model.FilesResponse;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

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
    @RequestParam(defaultValue = "") String path
  ) {
    var response = s3Client.listObjectsV2(
      ListObjectsV2Request.builder()
        .bucket(bucket)
        .prefix(path)
        .delimiter("/")
        .build()
    );

    var folders = response.commonPrefixes()
      .stream()
      .map(prefix -> new FileOrFolder()
        .setName(prefix.prefix().replace(path, ""))
        .setFolder(true)
      )
      .collect(Collectors.toList());

    var files = response.contents()
      .stream()
      .map(s3Object -> new FileOrFolder()
        .setName(s3Object.key().replace(path, ""))
        .setSize(s3Object.size())
        .setLastModified(s3Object.lastModified())
        .setETag(s3Object.eTag())
        .setMetadata(
          s3Client.headObject(
            HeadObjectRequest.builder()
              .bucket(bucket)
              .key(s3Object.key())
              .build()
          ).metadata()
        )
      )
      .collect(Collectors.toList());

    return ResponseEntity.ok(new FilesResponse(files, folders));
  }

  @PostMapping("/create-folder")
  public ResponseEntity<String> createFolder(
    @RequestParam String bucket,
    @RequestParam String key
  ) {
    s3Client.putObject(
      PutObjectRequest.builder()
        .bucket(bucket)
        .key(key + ".keep")
        .build(),
      RequestBody.fromBytes(new byte[0])
    );
    return ResponseEntity.ok("Folder created successfully: " + key);
  }

  @SneakyThrows
  @PostMapping("/upload")
  public ResponseEntity<String> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam String bucket,
    @RequestParam(defaultValue = "") String path,
    @RequestParam(required = false) Map<String, String> metadata
  ) {
    var response = s3Client.putObject(
      PutObjectRequest.builder()
        .bucket(bucket)
        .key(path + file.getOriginalFilename())
        .metadata(metadata)
        .build(),
      RequestBody.fromInputStream(file.getInputStream(), file.getSize())
    );

    return ResponseEntity.ok(
      "File uploaded successfully: " + path + file.getOriginalFilename()
      + ", ETag: " + response.eTag()
    );
  }

  @SneakyThrows
  @GetMapping("/download")
  public ResponseEntity<byte[]> downloadFile(@RequestParam String bucket, @RequestParam String key) {
    var requestBuilder = GetObjectRequest.builder()
      .bucket(bucket)
      .key(key);
    var response = s3Client.getObject(requestBuilder.build());
    return ResponseEntity.ok().body(response.readAllBytes());
  }

  @DeleteMapping
  public void deleteFile(@RequestParam String bucket, @RequestParam String key) {
    s3Client.deleteObject(
      DeleteObjectRequest.builder()
        .bucket(bucket)
        .key(key)
        .build()
    );
  }
}