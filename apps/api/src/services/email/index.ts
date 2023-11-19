import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { getSuccesfulEmailHtml } from "./succesfull-email.js";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("No environment variable set for SENDGRID_API_KEY");
}

export async function sendReportEmail({
  email,
  reportId,
}: {
  email: string;
  reportId: string;
}): Promise<void> {
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

  const emailSend = await sgMail.send(msg);

  if (emailSend[0].statusCode !== 202) {
    throw new Error(`Failed to send Email. Status: ${emailSend[0].statusCode}`);
  }
}

export async function sendFailureEmail({
  email,
}: {
  email: string;
}): Promise<void> {
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

  const emailSend = await sgMail.send(msg);

  if (emailSend[0].statusCode !== 202) {
    throw new Error(`Failed to send Email. Status: ${emailSend[0].statusCode}`);
  }
}
