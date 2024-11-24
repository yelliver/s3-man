package com.example.s3be.controller.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.Instant;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class FileOrFolder {
  private String name;
  private long size;
  private Instant lastModified;
  private boolean isFolder;
  private String eTag;
  private Map<String, String> metadata = Map.of();
}
