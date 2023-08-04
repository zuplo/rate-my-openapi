import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const id = params.id;

  const ogiImage = `https://www.ratemyopenapi.com/api/og/${id}`;
  const title = "Rate My OpenAPI";
  const description =
    "Upload your OpenAPI spec and we'll tell you how good it is.";
  const sitename = "ratemyopenapi.com";

  return {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://ratemyopenapi.com/report/${id}`,
      siteName: sitename,
      locale: "en_US",

      images: [ogiImage],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [ogiImage],
    },
  };
}

const ReportLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="pb-8">{children}</main>
);

export default ReportLayout;
