const isServer = typeof window === "undefined";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (isServer ? "http://localhost:3001" : "/api");
