import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { id: string };
};

export function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Metadata {
  const id = params.id;
  return {
    ...parent,
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
