import sgMail from "@sendgrid/mail";
import esMain from "es-main";
import { getSuccesfulEmailHtml } from "./succesfull-email.js";
import { Err, Ok, Result } from "ts-results-es";
import { resend } from "../../services/resend.js";
import { serializeError } from "serialize-error";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

type SendEmailResult = {
  resendId: string;
};

export const sendReportEmail = async ({
  email,
  reportId,
}: {
  email: string;
  reportId: string;
}): Promise<Result<SendEmailResult, GenericErrorResult>> => {
  const msg = {
    to: email,
    from: "onboarding@resend.dev",
    subject: "Your OpenAPI Report is Ready",
    text: "Visit here: https://ratemyopenapi.com/report/" + reportId,
    html: getSuccesfulEmailHtml({
      reportId,
    }),
  };

  try {
    const emailSend = await resend.emails.send(msg);

    return Ok({
      resendId: emailSend.id,
    });
  } catch (err) {
    return Err({
      errorMessage: `Could not send email to ${email}`,
      serializedError: serializeError(err),
    });
  }
};

type SendFailureEmailResult = {
  resendId: string;
};

export const sendFailureEmail = async ({
  email,
}: {
  email: string;
}): Promise<Result<SendFailureEmailResult, GenericErrorResult>> => {
  const msg = {
    to: email,
    from: "onboarding@resend.dev",
    subject: "We could not generate your report",
    text: `We could not generate your report. There was an issue with your OpenAPI file.`,
    html: "We could not generate your report. There was an issue with your OpenAPI file.",
  };

  try {
    const emailSend = await resend.emails.send(msg);

    return Ok({
      resendId: emailSend.id,
    });
  } catch (err) {
    return Err({
      errorMessage: `Could not send email to ${email}`,
      serializedError: serializeError(err),
    });
  }
};

// Run this without needing to run the entire app
// `npx tsx src/services/sendgrid.ts <email> <reportId>`
if (esMain(import.meta))
  sendReportEmail({
    email: process.argv[2],
    reportId: process.argv[3],
  })
    .then(console.log)
    .catch(console.error);
