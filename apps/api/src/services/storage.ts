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
export const getFileByName = async (fileName: string) => {
  if (!bucketName) {
    throw new Error("No bucket name");
  }

  const file = storage.bucket(bucketName).file(fileName);

  const [exists] = await file.exists();

  if (!exists) {
    throw new Error("File does not exist");
  }

  const [data] = await file.download();

  return data;
};

export const getUploadSignedUrl = async (fileName: string) => {
  if (!bucketName) {
    throw new Error("No bucket name");
  }

  const result = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: "application/octet-stream",
    })
    .catch(() => {
      throw new Error("Unable to generate signed URL");
    });

  return result[0];
};
