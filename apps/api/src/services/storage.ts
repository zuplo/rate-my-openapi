import { Bucket, Storage } from "@google-cloud/storage";

let storage: Storage | undefined;

export function getStorageClient(): Storage {
  if (!storage) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (!projectId) {
      throw new Error("Env variable GOOGLE_CLOUD_PROJECT_ID is not set");
    }
    storage = new Storage({
      projectId,
    });
  }
  return storage;
}

export function getStorageBucketName() {
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error("Env variable GOOGLE_CLOUD_STORAGE_BUCKET is not set");
  }

  return bucketName;
}

export function getStorageBucket(): Bucket {
  return getStorageClient().bucket(getStorageBucketName());
}
