import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { getSuccesfulEmailHtml } from "./succesfull-email.js";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("No environment variable set for SENDGRID_API_KEY");
}

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
}): Promise<SendEmailResult> => {
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

  return {
    statusCode: emailSend[0].statusCode,
    headers: emailSend[0].headers,
  };
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
}): Promise<SendFailureEmailResult> => {
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

  return {
    statusCode: emailSend[0].statusCode,
    headers: emailSend[0].headers,
  };
};
