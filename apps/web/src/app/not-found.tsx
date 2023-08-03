import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h2 className="mb-1 text-4xl">Not Found</h2>
      <p className="mb-5 text-xl">Could not find the requested report</p>
      <Link href="/" className="button-dark">
        Return Home
      </Link>
    </div>
  );
}
