import { downloadFile, uploadFile } from "../services/api";

interface FileHandlerProps {
  selectedBucket: string;
  path: string;
  selectedFiles?: string[]; // Optional to avoid undefined issues
  setShowUploadModal: (show: boolean) => void;
  refreshFiles: () => void;
}

export const handleUpload = async (
  file: File | null,
  metadata: Record<string, string>,
  { selectedBucket, path, setShowUploadModal, refreshFiles }: FileHandlerProps
): Promise<void> => {
  if (!file) {
    alert("No file selected for upload.");
    return;
  }

  try {
    await uploadFile(selectedBucket, path, file, metadata);
    refreshFiles(); // Reload the file list after upload
  } catch (error) {
    alert(`Failed to upload file: ${error instanceof Error ? error.message : error}`);
  } finally {
    setShowUploadModal(false);
  }
};

export const handleDownload = async ({
                                       selectedBucket,
                                       selectedFiles,
                                     }: FileHandlerProps): Promise<void> => {
  if (!selectedFiles || selectedFiles.length !== 1) {
    alert("Please select exactly one file to download.");
    return;
  }

  try {
    const blob = await downloadFile(selectedBucket, selectedFiles[0]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFiles[0];
    a.click();
  } catch (error) {
    alert(`Failed to download file: ${error instanceof Error ? error.message : error}`);
  }
};

export const handleDownloadAsZip = async ({
                                            selectedFiles,
                                          }: FileHandlerProps): Promise<void> => {
  if (!selectedFiles || selectedFiles.length === 0) {
    alert("Please select at least one file to download as a ZIP.");
    return;
  }

  console.log("Downloading files as ZIP:", selectedFiles);
  // Implement ZIP download logic here
};