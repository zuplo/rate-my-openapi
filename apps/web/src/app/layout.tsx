import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Roboto, Roboto_Mono, IBM_Plex_Sans } from "next/font/google";

import Header from "@/components/Header";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-plex-sans",
});

export const metadata = {
  title: "Rate My OpenAPI",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="en"
    className={`h-full ${roboto.variable} ${robotoMono.variable} ${ibmPlexSans.variable}`}
  >
    <body className="container mx-auto h-full bg-[#F8FAFC] text-base">
      <Header />
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
