import sgMail, { MailDataRequired } from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("No environment variable set for SENDGRID_API_KEY");
}

type ScoreBand = {
  text: string;
  bg: string;
  border: string;
};

const getScoreColors = (score: number): ScoreBand => {
  if (score >= 80) {
    return { text: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
  }
  if (score >= 50) {
    return { text: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  }
  return { text: "#e11d48", bg: "#ffe4e6", border: "#fecdd3" };
};

const getScoreHeadline = (score: number): { headline: string; sub: string } => {
  if (score >= 80) {
    return {
      headline: "You deserve a round of API-lause!",
      sub: "But don't REST on your laurels",
    };
  }
  if (score >= 65) {
    return {
      headline: "You're on the right track",
      sub: "Here's some tips to make your endpoints more API-ling",
    };
  }
  if (score >= 50) {
    return {
      headline: "We API-reciate the effort",
      sub: "But you're not quite there yet",
    };
  }
  return {
    headline: "You have some work to do",
    sub: "REST assured, we can help!",
  };
};

const buildCategory = (name: string, score: number) => {
  const colors = getScoreColors(score);
  return {
    name,
    score,
    width: Math.max(0, Math.min(100, Math.round(score))),
    color: colors.text,
    track: "#f3f4f6",
  };
};

export async function sendReportEmail({
  email,
  reportId,
  score,
  docsScore,
  completenessScore,
  sdkGenerationScore,
  securityScore,
}: {
  email: string;
  reportId: string;
  score: number;
  docsScore: number;
  completenessScore: number;
  sdkGenerationScore: number;
  securityScore: number;
}): Promise<void> {
  const scoreBand = getScoreColors(score);
  const { headline, sub } = getScoreHeadline(score);

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
      score: Math.round(score),
      headline,
      headlineSub: sub,
      scoreColor: scoreBand.text,
      scoreBg: scoreBand.bg,
      scoreBorder: scoreBand.border,
      categories: [
        buildCategory("Documentation", docsScore),
        buildCategory("Completeness", completenessScore),
        buildCategory("SDK Readiness", sdkGenerationScore),
        buildCategory("Security", securityScore),
      ],
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
