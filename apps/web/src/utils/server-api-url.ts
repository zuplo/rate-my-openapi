import "server-only";
import { headers } from "next/headers";

export async function getServerApiUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    throw new Error(
      "Unable to resolve server API URL: missing host header and NEXT_PUBLIC_API_URL",
    );
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/api`;
}
