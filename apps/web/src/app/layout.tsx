import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata = {
  title: "Rate My OpenAPI",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <header className="py-2">
          <h1 className="text-2xl">Rate My OpenAPI</h1>
          <p className="text-xs">
            powered by zuplo.com - the API gateway reinvented
          </p>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
