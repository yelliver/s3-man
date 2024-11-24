const BASE_URL = "http://localhost:8080";

export const fetchBuckets = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/buckets`);
    if (!response.ok) {
      throw new Error(`Failed to fetch buckets: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching buckets:", error);
    return [];
  }
};


interface ServerFile {
  name: string;
  size: number;
  lastModified: string;
  metadata: Record<string, string>;
  etag: string;
  folder: boolean;
}

interface ServerFolder {
  name: string;
}

interface FetchFilesAndFoldersResponse {
  files: ServerFile[];
  folders: ServerFolder[];
}

export const fetchFilesAndFolders = async (
  bucket: string,
  path: string
): Promise<ServerFile[]> => {
  const url = `${BASE_URL}/api/files?bucket=${bucket}&path=${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch files and folders: ${response.statusText}`);
  }

  const data: FetchFilesAndFoldersResponse = await response.json();

  // Map server response into unified structure
  const folders = data.folders.map((folder) => ({
    name: folder.name,
    size: 0,
    lastModified: "",
    metadata: {},
    etag: "",
    folder: true,
  }));

  const files = data.files.map((file) => ({
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    metadata: file.metadata,
    etag: file.etag,
    folder: false,
  }));

  return [...folders, ...files]; // Combine files and folders into a single array
};

export const createBucket = async (bucketName: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/buckets/${bucketName}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  } catch (error) {
    console.error("Error creating bucket:", error);
    throw error;
  }
};

export const deleteBucket = async (bucketName: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/buckets/${bucketName}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  } catch (error) {
    console.error("Error deleting bucket:", error);
    throw error;
  }
};

export const createFolder = async (bucket: string, folderPath: string): Promise<void> => {
  const url = `${BASE_URL}/api/files/create-folder?bucket=${bucket}&key=${folderPath}`;
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }
};

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  metadata: Record<string, string>
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(`metadata[${key}]`, value);
    });

    const response = await fetch(
      `${BASE_URL}/api/files/upload?bucket=${bucket}&path=${path}`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const deleteFile = async (bucket: string, path: string, key: string): Promise<void> => {
  const url = `${BASE_URL}/api/files?bucket=${bucket}&path=${path}&key=${key}`;
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
};

export const downloadFile = async (
  bucket: string,
  key: string
): Promise<Blob> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/files/download?bucket=${bucket}&key=${key}`
    );
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};