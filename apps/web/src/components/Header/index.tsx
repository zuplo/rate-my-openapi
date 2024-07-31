import LogoIcon from "../LogoIcon";

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
      <a href="https://zuplo.com">
        <LogoIcon height={30} width={30} />
      </a>
    </div>
  </header>
);

export default Header;
