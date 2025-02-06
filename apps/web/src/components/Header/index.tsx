import Link from "next/link";
import Image from "next/image";

const Header = () => (
  <header className="xl:pt-8 px-4 pt-4">
    <div className="xl:p-5 flex justify-between rounded-lg bg-white p-3 shadow-md">
      <div className="relative">
        <a href="/" className="flex justify-center">
          <h1 className="xl:text-2xl text-xl font-bold">
            rate<span className="text-gray-500">my</span>openapi
          </h1>
        </a>
      </div>
      <div className="flex items-center">
        <Link target="_blank" href="https://github.com/zuplo/rate-my-openapi">
          <Image
            height={0}
            width={124}
            alt="GitHub Repo stars"
            unoptimized
            src="https://img.shields.io/github/stars/zuplo/rate-my-openapi"
          />
        </Link>
      </div>
    </div>
  </header>
);

export default Header;
