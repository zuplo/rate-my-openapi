import { type ISpectralDiagnostic } from "@stoplight/spectral-core";

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
    const contents = await storage
      .bucket(bucket as string)
      .file(`${params.id}-report.json`)
      .download();

    if (contents) {
      const parsedContents = JSON.parse(contents.toString());

      const data = (({
        score,
        docsScore,
        completenessScore,
        sdkGenerationScore,
        securityScore,
        docsIssues,
        completenessIssues,
        sdkGenerationIssues,
        securityIssues,
      }) => ({
        score,
        docsScore,
        completenessScore,
        sdkGenerationScore,
        securityScore,
        docsIssues: groupIssues(docsIssues),
        completenessIssues: groupIssues(completenessIssues),
        sdkGenerationIssues: groupIssues(sdkGenerationIssues),
        securityIssues: groupIssues(securityIssues),
        fileType: parsedContents?.issues?.[0]?.source?.split(".").pop(),
      }))(parsedContents);

      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json<null>(null, { status: 204 });
  } catch (e) {
    console.error(e);

    return NextResponse.json<null>(null, {
      status: (e as GoogleRequestError).code,
    });
  }
}

type Issue = {
  message: string;
  severity: number;
  count: number;
};

const groupIssues = (issues: ISpectralDiagnostic[]) => {
  const groupedIssues: Issue[] = [];

  issues.forEach((issue) => {
    if (!groupedIssues.find(({ message }) => message === issue.message)) {
      groupedIssues.push({
        message: issue.message,
        severity: issue.severity,
        count: issues.filter(({ message }) => message === issue.message).length,
      });
    }
  });

  const formattedIssues = groupedIssues.map((issue) => ({
    ...issue,
    message: issue.message.replace(/`(.*?)`/g, "<code>$1</code>"),
  }));

  const sortedIssues = formattedIssues.sort(
    (a, b) =>
      a.severity - b.severity ||
      b.count - a.count ||
      a.message.localeCompare(b.message)
  );

  return sortedIssues;
};
