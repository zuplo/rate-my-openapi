const LINKS = [
  {
    title: "Docs",
    href: "",
  },
  {
    title: "How it works",
    href: "",
  },
  {
    title: "Highscores",
    href: "",
  },
  {
    title: "Github",
    href: "",
  },
];

const Header = () => (
  <header className="absolute top-16 flex justify-between rounded-xl bg-white p-5 shadow-md">
    <div>
      <h1 className=" text-2xl font-bold">ratemyopenapi</h1>
    </div>
    <ul className="grid grid-cols-4 gap-4 text-center font-bold text-gray-600">
      {LINKS.map((link, i) => (
        <li
          key={`${link.title}-${i}`}
          className="flex items-center justify-center"
        >
          {link.title}
        </li>
      ))}
    </ul>
  </header>
);

export default Header;
