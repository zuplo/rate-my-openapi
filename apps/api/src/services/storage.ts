import { Storage } from "@google-cloud/storage";

const { GOOGLE_SERVICE_ACCOUNT_B64, GOOGLE_CLOUD_STORAGE_BUCKET: bucketName } =
  process.env;

const credential = JSON.parse(
  Buffer.from(GOOGLE_SERVICE_ACCOUNT_B64 as string, "base64")
    .toString()
    .replace(/\n/g, "")
);

export const storage = new Storage({
  projectId: credential.project_id,
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
});

export const getStorageBucketName = () => {
  if (!bucketName) {
    throw new Error("Env variable GOOGLE_CLOUD_STORAGE_BUCKET is not set");
  }

  return bucketName;
};