package com.example.s3be.controller;

import com.amazonaws.util.IOUtils;
import com.example.s3be.controller.model.FileOrFolder;
import com.example.s3be.controller.model.FilesResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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

  @PostMapping("/copy")
  public ResponseEntity<String> copyFile(
    @RequestParam String sourceBucket,
    @RequestParam String sourceKey,
    @RequestParam String destinationBucket,
    @RequestParam String destinationKey
  ) {
    var copyRequest = CopyObjectRequest.builder()
      .sourceBucket(sourceBucket)
      .sourceKey(sourceKey)
      .destinationBucket(destinationBucket)
      .destinationKey(destinationKey)
      .build();

    s3Client.copyObject(copyRequest);

    return ResponseEntity.ok(
      String.format("File copied successfully from %s/%s to %s/%s",
        sourceBucket, sourceKey, destinationBucket, destinationKey)
    );
  }

  @GetMapping("/download")
  public void downloadFile(@RequestParam String bucket, @RequestParam String key, HttpServletResponse response) {
    var requestBuilder = GetObjectRequest.builder()
      .bucket(bucket)
      .key(key);
    try (var s3Response = s3Client.getObject(requestBuilder.build()); var outputStream = response.getOutputStream()) {
      response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
      response.setHeader("Content-Disposition", "attachment; filename=\"" + Paths.get(key).getFileName().toString() + "\"");
      IOUtils.copy(s3Response, outputStream);
      outputStream.flush();
    } catch (Exception e) {
      throw new RuntimeException("Error while streaming file", e);
    }
  }

  @GetMapping("/download-zip")
  public void downloadZip(
    @RequestParam String bucket,
    @RequestParam List<String> keys,
    HttpServletResponse response
  ) {
    try {
      String zipFileName;
      if (keys.size() == 1) {
        var originalFileName = Path.of(keys.get(0)).getFileName().toString();
        zipFileName = originalFileName.replaceAll("\\.[^.]+$", "") + ".zip";
      } else {
        zipFileName = "files-" + Instant.now().toEpochMilli() + ".zip";
      }
      response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
      response.setHeader("Content-Disposition", "attachment; filename=\"" + zipFileName + "\"");
      try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {
        for (var key : keys) {
          var requestBuilder = GetObjectRequest.builder().bucket(bucket).key(key);
          try (var s3Response = s3Client.getObject(requestBuilder.build())) {
            zipOutputStream.putNextEntry(new ZipEntry(Path.of(key).getFileName().toString()));
            s3Response.transferTo(zipOutputStream);
            zipOutputStream.closeEntry();
          }
        }
        zipOutputStream.flush();
      }
    } catch (Exception e) {
      throw new RuntimeException("Error while creating ZIP file", e);
    }
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