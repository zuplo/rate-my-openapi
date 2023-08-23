const EXAMPLES: { title: string; slug: string }[] = [
  {
    title: "Asana",
    slug: "022f6169-763f-4970-ad3e-599eaca76dd7",
  },
  {
    title: "Twilio",
    slug: "330373e1-8e4a-4181-af5f-560f1d4267df",
  },
  {
    title: "Zuplo",
    slug: "934bc050-9590-4496-9433-73deeec452ff",
  },
];

export const RatingExamples = ({ children }: { children: React.ReactNode }) => (
  <div className="m-10 flex flex-col items-center">
    {children}
    <ul className="flex flex-wrap items-center gap-3">
      {EXAMPLES.map((example) => (
        <li key={example.slug}>
          <a
            className="block rounded-lg bg-gray-200 p-2 font-medium text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
            href={`/report/${example.slug}`}
          >
            {example.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
