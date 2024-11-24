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

export const fetchFilesAndFolders = async (
  bucket: string,
  folderPath: string
): Promise<
  { name: string; type: "file" | "folder"; size?: string; lastModified?: string }[]
> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/files?bucketName=${bucket}&path=${folderPath}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch files and folders: ${response.statusText}`);
    }
    const data = await response.json();
    return [
      ...data.folders.map((folder: string) => ({
        name: folder,
        type: "folder",
      })),
      ...data.files.map((file: any) => ({
        name: file.name,
        type: "file",
        size: file.size,
        lastModified: file.lastModified,
      })),
    ];
  } catch (error) {
    console.error("Error fetching files and folders:", error);
    return [];
  }
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
      `${BASE_URL}/api/files/upload?bucketName=${bucket}&path=${path}`,
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

export const downloadFile = async (
  bucket: string,
  fileName: string
): Promise<Blob> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/files/download?bucketName=${bucket}&fileName=${fileName}`
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