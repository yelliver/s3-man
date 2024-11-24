export const fetchBuckets = (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Bucket 1", "Bucket 2", "Bucket 3"]);
    }, 1000); // Simulate 1-second delay
  });
};

export const fetchFilesAndFolders = (
  bucket: string,
  folderPath: string
): Promise<
  { name: string; type: "file" | "folder"; size?: string; lastModified?: string }[]
> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: { [path: string]: any[] } = {
        "Bucket 1/": [
          {name: "Documents", type: "folder"},
          {
            name: "file1.txt",
            type: "file",
            size: "15 KB",
            lastModified: "2024-11-24",
          },
          {
            name: "file2.jpg",
            type: "file",
            size: "2 MB",
            lastModified: "2024-11-23",
          },
        ],
        "Bucket 1/Documents/": [
          {
            name: "report.docx",
            type: "file",
            size: "50 KB",
            lastModified: "2024-11-18",
          },
          {
            name: "notes.txt",
            type: "file",
            size: "10 KB",
            lastModified: "2024-11-17",
          },
        ],
        "Bucket 2/": [
          {name: "Images", type: "folder"},
          {
            name: "document.pdf",
            type: "file",
            size: "500 KB",
            lastModified: "2024-11-19",
          },
        ],
        "Bucket 2/Images/": [
          {
            name: "photo.png",
            type: "file",
            size: "1 MB",
            lastModified: "2024-11-20",
          },
        ],
      };
      resolve(mockData[`${bucket}/${folderPath}`] || []);
    }, 1000); // Simulate 1-second delay
  });
};