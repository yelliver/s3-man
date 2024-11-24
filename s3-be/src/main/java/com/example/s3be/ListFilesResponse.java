package com.example.s3be;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListFilesResponse {
  private List<FileMetadata> files;
  private List<FileMetadata> folders;
}
