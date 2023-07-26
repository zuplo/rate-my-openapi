import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Rate My OpenAPI",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className="h-full">
    <body className="container mx-auto h-full bg-[#F8FAFC] text-base">
      <Header />
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
