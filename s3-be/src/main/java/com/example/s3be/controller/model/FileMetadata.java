package com.example.s3be.controller.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileMetadata {
  private String name;
  private long size;
  private String lastModified;
  private boolean isFolder;
  private Map<String, String> metadata;
  private String eTag;
}
