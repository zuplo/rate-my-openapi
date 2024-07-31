import Link from "next/link";

interface RatingExamplesProps {
  children?: React.ReactNode; // Make children optional
}

const EXAMPLES: { title: string; slug: string }[] = [
  {
    title: "Asana",
    slug: "31bae2fb-bda1-471b-8c1d-142816e2fa10",
  },
  {
    title: "Zapier",
    slug: "26e31dbc-784a-47ca-b47d-72bf502b58cb",
  },
  {
    title: "Zuplo",
    slug: "d7d4e329-bd95-478c-88c8-45854be1706e",
  },
];

export const RatingExamples = ({ children }: RatingExamplesProps) => (
  <div className="mx-10 my-5 flex flex-col items-center justify-center gap-4 md:flex-row">
    {children ? (
      <div>{children}</div>
    ) : (
      <p className="m-2 text-lg text-gray-400">See an example report</p>
    )}
    <ul className="flex flex-wrap items-center gap-3">
      {EXAMPLES.map((example) => (
        <li key={example.slug}>
          <Link
            className="block rounded-lg bg-gray-200 p-2 font-medium text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
            href={`/report/${example.slug}`}
            prefetch={true}
          >
            {example.title}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
