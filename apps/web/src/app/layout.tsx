import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata = {
  title: "Rate My OpenAPI",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="h-full">
      <body className="container relative mx-auto h-full bg-[#F8FAFC] text-base">
        <header className="absolute top-16 flex justify-between rounded-xl bg-white p-5 shadow-md">
          <div>
            <h1 className=" text-2xl font-bold">ratemyopenapi</h1>
          </div>
          <ul className="grid grid-cols-4 gap-4 text-center font-bold text-gray-600">
            <li className="flex items-center justify-center">Docs</li>
            <li className="flex items-center justify-center">How it works</li>
            <li className="flex items-center justify-center">Highscores</li>
            <li className="flex items-center justify-center">Github</li>
          </ul>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
