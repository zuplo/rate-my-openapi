import sgMail from "@sendgrid/mail";
import esMain from "es-main";
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export const sendReportEmail = async ({
  email,
  reportId,
}: {
  email: string;
  reportId: string;
}) => {
  const msg = {
    to: email,
    from: "hello@ratemyopenapi.com",
    subject: "Your OpenAPI Report is Ready",
    text: "Visit here: https://ratemyopenapi.com/report/" + reportId,
    html:
      "Visit your report here: https://ratemyopenapi.com/report/" + reportId,
  };

  try {
    const emailSend = await sgMail.send(msg);

    return {
      statusCode: emailSend[0].statusCode,
      headers: emailSend[0].headers,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const sendFailureEmail = async ({
  email,
  reportId,
}: {
  email: string;
  reportId: string;
}) => {
  const msg = {
    to: email,
    from: "hello@ratemyopenapi.com",
    subject: "We could not generate your report",
    text: `We could not generate your report. There was an issue with your OpenAPI file.`,
    html: "We could not generate your report. There was an issue with your OpenAPI file.",
  };

  try {
    const emailSend = await sgMail.send(msg);

    return {
      statusCode: emailSend[0].statusCode,
      headers: emailSend[0].headers,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Run this without needing to run the entire app
// `node dist/services/sendgrid.js <email> <reportId>`
if (esMain(import.meta))
  sendReportEmail({
    email: process.argv[2],
    reportId: process.argv[3],
  })
    .then(console.log)
    .catch(console.error);
