import { House } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="tag tag-neutral is-caps">404</span>
      <h2 className="font-display text-fg text-2xl font-semibold md:text-3xl">
        Not Found
      </h2>
      <p className="text-fg-muted text-sm">
        We couldn&apos;t find the report you were looking for.
      </p>
      <Link href="/" className="btn btn-dark mt-2">
        <House size={16} weight="regular" />
        <span>Return home</span>
      </Link>
    </div>
  );
}
