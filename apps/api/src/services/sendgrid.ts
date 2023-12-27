import sgMail, { MailDataRequired } from "@sendgrid/mail";

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
  const msg: MailDataRequired = {
    to: email,
    from: {
      name: "Rate My OpenAPI",
      email: "hello@ratemyopenapi.com",
    },
    // Rating Success Template
    // https://mc.sendgrid.com/dynamic-templates
    templateId: "d-a8a7ae2f68394d6a89e78d495e2b2b73",
    dynamicTemplateData: {
      reportId,
    },
  };

  const emailSend = await sgMail.send(msg);

  if (emailSend[0].statusCode !== 202) {
    throw new Error(
      `Failed to send Email. Status: ${emailSend[0].statusCode}. Recipient: ${email}}`,
    );
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
    // Rating Failure Template
    // https://mc.sendgrid.com/dynamic-templates
    templateId: "d-121cdefa851e457bbe9ceeeb6de10f86",
  };

  const emailSend = await sgMail.send(msg);

  if (emailSend[0].statusCode !== 202) {
    throw new Error(
      `Failed to send Email. Status: ${emailSend[0].statusCode}. Recipient: ${email}`,
    );
  }
}
