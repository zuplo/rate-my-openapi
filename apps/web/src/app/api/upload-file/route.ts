import { NextResponse } from "next/server";
import { inngest } from "../inngest-client";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("apiFile") as File;
  const email = formData.get("emailAddress") as string;

  try {
    if (file && email) {
      const fileType = file.name.split(".").pop();
      const fileContents = await file.text();

      await inngest.send({
        name: "api/upload",
        data: {
          email,
          fileType,
          file: Buffer.from(fileContents),
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      if (!file && !email) {
        throw new Error("Invalid or missing file and email");
      }
      if (!file) {
        throw new Error("Invalid or missing file");
      }
      if (!email) {
        throw new Error("Invalid or missing email");
      }
    }
  } catch (e) {
    return NextResponse.json(e, { status: 400 });
  }
}
