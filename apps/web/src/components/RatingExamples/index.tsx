import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface RatingExamplesProps {
  children?: React.ReactNode;
}

const EXAMPLES: { title: string; slug: string }[] = [
  { title: "Asana", slug: "31bae2fb-bda1-471b-8c1d-142816e2fa10" },
  { title: "Zapier", slug: "26e31dbc-784a-47ca-b47d-72bf502b58cb" },
  { title: "Zuplo", slug: "d7d4e329-bd95-478c-88c8-45854be1706e" },
];

export const RatingExamples = ({ children }: RatingExamplesProps) => (
  <div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row">
    <div className="text-fg-faint text-xs font-medium tracking-[0.05em] uppercase">
      {children ?? "See an example report"}
    </div>
    <ul className="flex flex-wrap items-center gap-2">
      {EXAMPLES.map((example) => (
        <li key={example.slug}>
          <Link
            href={`/report/${example.slug}`}
            prefetch={true}
            className="border-border bg-bg text-fg-secondary hover:border-border-strong hover:bg-bg-muted hover:text-fg inline-flex h-[30px] items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors"
          >
            <span>{example.title}</span>
            <ArrowRight size={12} weight="regular" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
