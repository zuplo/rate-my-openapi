import Link from "next/link";
import { GithubLogo, Heart, XLogo } from "@phosphor-icons/react/dist/ssr";

const socials = [
  {
    href: "https://twitter.com/zuplo",
    label: "Zuplo on X",
    Icon: XLogo,
  },
  {
    href: "https://github.com/zuplo/rate-my-openapi",
    label: "rate-my-openapi on GitHub",
    Icon: GithubLogo,
  },
];

const Footer = () => (
  <footer className="border-border mt-16 w-full border-t">
    <div className="text-fg-muted mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
      <div className="flex items-center gap-1.5 text-[13px]">
        <span>Created with</span>
        <Heart size={14} weight="fill" className="text-accent" />
        <span>by</span>
        <Link
          href="https://zuplo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-fg hover:text-accent font-semibold transition-colors"
        >
          Zuplo
        </Link>
      </div>
      <div className="flex items-center gap-1">
        {socials.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="btn btn-ghost btn-icon"
          >
            <Icon size={18} weight="regular" />
          </Link>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
