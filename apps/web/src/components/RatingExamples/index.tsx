import Link from "next/link";

const EXAMPLES: { title: string; slug: string }[] = [
  {
    title: "Stripe",
    slug: "9dda3db0-ed13-4563-a144-835d550f63ad",
  },
  {
    title: "GitHub",
    slug: "7f898483-ba2b-4b17-8278-fc241a6a5c0d",
  },
  {
    title: "Zuplo",
    slug: "934bc050-9590-4496-9433-73deeec452ff",
  },
  {
    title: "Spotify",
    slug: "6fab0561-259a-47c0-b21a-16c02b19fede",
  },
];

export const RatingExamples = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="m-10 flex flex-col items-center">
      {children}
      <ul className="flex flex-wrap items-center gap-3">
        {EXAMPLES.map((example) => (
          <li key={example.slug}>
            <Link
              className="block rounded-lg bg-gray-200 p-2 font-medium text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
              href={`/report/${example.slug}`}
            >
              {example.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
