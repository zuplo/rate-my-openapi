import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const id = params.id;
  return {
    title: "Rate My OpenAPI",
    description: "Upload your OpenAPI spec and we'll tell you how good it is.",
    openGraph: {
      title: "Rate My OpenAPI",
      description:
        "Upload your OpenAPI spec and we'll tell you how good it is.",
      type: "website",
      url: `https://ratemyopenapi.com/report/${id}`,
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
