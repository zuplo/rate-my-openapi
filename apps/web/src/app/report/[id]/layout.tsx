import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const id = params.id;
  return {
    title: "Report - Rate My OpenAPI",
    openGraph: {
      images: [
        {
          url: `https://ratemyopenapi.com/api/og/${id}`,
        },
      ],
    },
  };
}

const ReportLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="pb-8 pt-[90px] md:pt-[136px]">{children}</main>
);

export default ReportLayout;
