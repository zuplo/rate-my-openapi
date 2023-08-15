import sgMail, { MailDataRequired } from "@sendgrid/mail";
import esMain from "es-main";
import { getSuccesfulEmailHtml } from "./succesfull-email.js";
import { Err, Ok, Result } from "ts-results-es";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

type SendEmailResult = {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
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
    from: {
      name: "Rate My OpenAPI",
      email: "hello@ratemyopenapi.com",
    },
    subject: "Your OpenAPI Report is Ready",
    text: "Visit here: https://ratemyopenapi.com/report/" + reportId,
    html: getSuccesfulEmailHtml({
      reportId,
    }),
  };

  try {
    const emailSend = await sgMail.send(msg);

    return Ok({
      statusCode: emailSend[0].statusCode,
      headers: emailSend[0].headers,
    });
  } catch (err) {
    return Err({
      error: `Could not send email to ${email}: ${err}`,
    });
  }
};

type SendFailureEmailResult = {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
};

export const sendFailureEmail = async ({
  email,
}: {
  email: string;
}): Promise<Result<SendFailureEmailResult, GenericErrorResult>> => {
  const msg: MailDataRequired = {
    to: email,
    from: {
      name: "Rate My OpenAPI",
      email: "hello@ratemyopenapi.com",
    },
    subject: "We could not generate your report",
    text: `We could not generate your report. There was an issue with your OpenAPI file.`,
    html: "We could not generate your report. There was an issue with your OpenAPI file.",
  };

  try {
    const emailSend = await sgMail.send(msg);

    return Ok({
      statusCode: emailSend[0].statusCode,
      headers: emailSend[0].headers,
    });
  } catch (err) {
    return Err({
      error: `Could not send email to ${email}: ${err}`,
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
