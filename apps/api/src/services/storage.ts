import { Storage } from "@google-cloud/storage";

const {
  GOOGLE_CLOUD_STORAGE_BUCKET: bucketName,
  GOOGLE_CLOUD_PROJECT_ID: projectId,
} = process.env;

export const storage = new Storage({
  projectId,
});

export const getStorageBucketName = () => {
  if (!bucketName) {
    throw new Error("Env variable GOOGLE_CLOUD_STORAGE_BUCKET is not set");
  }

  return bucketName;
};
