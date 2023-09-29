import Link from "next/link";
import LogoIcon from "../LogoIcon";

const Header = () => (
  <header className="px-4 pt-4 md:pt-8">
    <div className="flex justify-between rounded-xl bg-white p-5 shadow-md">
      <div className="relative">
        <Link href="/" className="flex justify-center">
          <h1 className=" text-2xl font-bold">
            rate<span className="text-gray-500">my</span>openapi
          </h1>
        </Link>
        <div className="bg-zuplo-pink font-semibold absolute left-36 top-6 -rotate-[24deg] rounded-full bg-pink-500 px-2 text-xs text-white shadow-md drop-shadow-sm">
          Beta
        </div>
      </div>
      <a href="https://zuplo.com">
        <LogoIcon height={33} width={33} />
      </a>
    </div>
  </header>
);

export default Header;
