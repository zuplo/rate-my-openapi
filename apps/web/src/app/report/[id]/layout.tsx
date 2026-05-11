import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const ogiImage = `https://www.ratemyopenapi.com/og/${id}`;
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
  <div className="pb-8">{children}</div>
);

export default ReportLayout;
