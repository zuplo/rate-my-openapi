import LogoIcon from "../LogoIcon";

const LINKS: { title: string; href: string }[] = [
  // {
  //   title: "Docs",
  //   href: "",
  // },
  // {
  //   title: "How it works",
  //   href: "",
  // },
  // {
  //   title: "Highscores",
  //   href: "",
  // },
  // {
  //   title: "Github",
  //   href: "",
  // },
];

const Header = () => (
  <header className="absolute top-4 px-4 md:top-16">
    <div className="flex justify-between rounded-xl bg-white p-5 shadow-md">
      <div className="flex justify-center">
        <LogoIcon className="mr-2" />
        <h1 className=" text-2xl font-bold">
          rate<span className="text-gray-500">my</span>openapi
        </h1>
      </div>
      <ul className="grid grid-cols-4 gap-4 text-center font-bold text-gray-600">
        {LINKS.map((link, i) => (
          <li key={`${link.title}-${i}`} className="flex items-center">
            {link.title}
          </li>
        ))}
      </ul>
    </div>
  </header>
);

export default Header;
