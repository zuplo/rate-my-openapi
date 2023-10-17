import Link from "next/link";
import LogoIcon from "../LogoIcon";

const Header = () => (
  <header className="px-4 pt-4 md:pt-8">
    <div className="flex justify-between rounded-xl bg-white p-5 shadow-md">
      <div className="relative">
        <a href="/" className="flex justify-center">
          <h1 className=" text-2xl font-bold">
            rate<span className="text-gray-500">my</span>openapi
          </h1>
        </a>
      </div>
      <a href="https://zuplo.com">
        <LogoIcon height={33} width={33} />
      </a>
    </div>
  </header>
);

export default Header;
