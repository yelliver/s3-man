import {createBucket, deleteBucket, fetchBuckets} from "../services/api";

interface BucketHandlerProps {
  setBuckets: (buckets: string[]) => void;
  setSelectedBucket: (bucket: string) => void;
  setPath: (path: string) => void;
  refreshFiles: () => void;
  setLoading: (loading: boolean) => void;
}

export const loadBuckets = async (): Promise<string[]> => {
  try {
    return await fetchBuckets();
  } catch (error) {
    console.error("Error fetching bucket list:", error instanceof Error ? error.message : error);
    throw error;
  }
};

export const handleBucketClick = async (
  bucket: string,
  {setSelectedBucket, setPath, refreshFiles, setLoading}: BucketHandlerProps
): Promise<void> => {
  setSelectedBucket(bucket);
  setPath(""); // Reset to root path
  setLoading(true);
  try {
    await refreshFiles();
  } catch (error) {
    console.error("Error loading bucket files:", error instanceof Error ? error.message : error);
  } finally {
    setLoading(false);
  }
};

export const handleCreateBucket = async (
  bucketName: string,
  {setBuckets}: BucketHandlerProps
): Promise<void> => {
  try {
    await createBucket(bucketName);
    const buckets = await fetchBuckets();
    setBuckets(buckets);
  } catch (error) {
    alert(`Failed to create bucket: ${error instanceof Error ? error.message : error}`);
  }
};

export const handleDeleteBucket = async (
  bucketName: string,
  {setBuckets}: BucketHandlerProps
): Promise<void> => {
  if (!window.confirm(`Are you sure you want to delete the bucket: ${bucketName}?`)) return;
  try {
    await deleteBucket(bucketName);
    const buckets = await fetchBuckets();
    setBuckets(buckets);
  } catch (error) {
    alert(`Failed to delete bucket: ${error instanceof Error ? error.message : error}`);
  }
};