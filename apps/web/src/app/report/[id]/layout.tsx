import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const id = params.id;
  return {
    metadataBase: new URL("https://ratemyopenapi.com"),
    title: "Report - Rate My OpenAPI",
    openGraph: {
      images: [
        {
          url: `/api/og/${id}`,
        },
      ],
    },
  };
}

const ReportLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="pb-8">{children}</main>
);

export default ReportLayout;
