const { NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BUCKET: bucket } = process.env;

const getStorageUrl = (file: string) =>
  `https://storage.googleapis.com/${bucket}/${file}`;

export default getStorageUrl;
