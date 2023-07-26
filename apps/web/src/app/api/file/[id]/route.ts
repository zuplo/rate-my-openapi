import { type OpenAPIV3 } from "openapi-types";

import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

type GoogleRequestError = { code: number; errors?: Error[] };

const {
  GOOGLE_SERVICE_ACCOUNT_B64,
  NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BUCKET: bucket,
} = process.env;

const credential = JSON.parse(
  Buffer.from(GOOGLE_SERVICE_ACCOUNT_B64 as string, "base64")
    .toString()
    .replace(/\n/g, "")
);

const storage = new Storage({
  projectId: credential.project_id,
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const file = storage.bucket(bucket as string).file(`${params.id}.json`);
    const contents = await file.download();
    const contentsJson = JSON.parse(contents.toString());
    const publicUrl = file.publicUrl();

    if (contents) {
      return NextResponse.json<{
        title: Pick<OpenAPIV3.InfoObject, "title">;
        version: Pick<OpenAPIV3.InfoObject, "version">;
        url: string;
      }>(
        {
          title: contentsJson.info.title,
          version: contentsJson.info.version,
          url: publicUrl,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<null>(null, { status: 204 });
    }
  } catch (e) {
    return NextResponse.json<null>(null, {
      status: (e as GoogleRequestError).code,
    });
  }
}
