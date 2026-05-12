import Image from "next/image";
import Link from "next/link";
import { GithubLogo, Star } from "@phosphor-icons/react/dist/ssr";

const formatStars = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${count}`;
};

const getStarCount = async (): Promise<number | null> => {
  try {
    const res = await fetch(
      "https://api.github.com/repos/zuplo/rate-my-openapi",
      {
        next: { revalidate: 60 * 60 * 6 },
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
};

const Header = async () => {
  const stars = await getStarCount();
  return (
    <header className="bg-bg-subtle/80 sticky top-0 z-20 w-full backdrop-blur">
      <div className="mx-auto flex h-[64px] w-full max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="focus-ring flex items-center rounded-md"
          aria-label="Rate My OpenAPI home"
        >
          <Image
            src="/images/logo.png"
            alt="ratemyopenapi"
            width={950}
            height={280}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/zuplo/rate-my-openapi"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm gap-2"
            aria-label="View on GitHub"
          >
            <GithubLogo size={16} weight="regular" />
            <span>GitHub</span>
            {stars !== null && (
              <span className="badge-numeric badge-numeric-neutral inline-flex items-center gap-1">
                <Star size={10} weight="fill" />
                {formatStars(stars)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
