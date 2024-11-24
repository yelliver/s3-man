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
    const response = await fetch(`${BASE_URL}/api/files?bucketName=${bucket}&path=${folderPath}`);
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
