import "./globals.css";

import { PHProvider, PostHogPageview } from "./providers";
import { Roboto, Roboto_Mono, IBM_Plex_Sans } from "next/font/google";

import Header from "@/components/Header";
import { Suspense } from "react";
import Footer from "@/components/Footer";

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
    className={`h-screen ${roboto.variable} ${robotoMono.variable} ${ibmPlexSans.variable}`}
  >
    <Suspense>
      <PostHogPageview />
    </Suspense>
    <PHProvider>
      <body className="container mx-auto flex h-full flex-col justify-between bg-[#F8FAFC] text-base">
        <Header />
        {children}
        <Footer />
      </body>
    </PHProvider>
  </html>
);

export default RootLayout;
