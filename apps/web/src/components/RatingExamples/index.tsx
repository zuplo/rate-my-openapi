const EXAMPLES: { title: string; slug: string }[] = [
  {
    title: "Asana",
    slug: "378c2bb4-e4f0-4654-ac42-4a6bca6a572c",
  },
  {
    title: "Zapier",
    slug: "f865aeb5-0e2f-41aa-922c-1195a300b529",
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
