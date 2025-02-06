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
      <div className="flex items-center gap-x-2">
        <a
          target="_blank"
          className="hidden h-[28px] items-center gap-x-1 rounded-[4px] border border-[#464ec7] bg-[#5865F2] p-2 py-[4px] hover:bg-[#464ec7] md:flex"
          href="https://discord.zuplo.com"
        >
          <Image
            className="h-[16px] w-auto"
            height={16}
            width={16}
            alt="Discord"
            src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
          />
          <p className="font-sans text-[15px] font-medium  text-white">
            Discord
          </p>
        </a>
        <Link target="_blank" href="https://github.com/zuplo/mockbin">
          <Image
            height={0}
            width={124}
            alt="GitHub Repo stars"
            unoptimized
            src="https://img.shields.io/github/stars/zuplo/mockbin"
          />
        </Link>
      </div>
    </div>
  </header>
);

export default Header;
