import "./globals.css";

import { Metadata } from "next";
import { IBM_Plex_Sans, Roboto, Roboto_Mono } from "next/font/google";
import { Suspense } from "react";

import { ModalProvider, PHProvider, PostHogPageview } from "./providers";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "Rate My OpenAPI",
  description: "Upload your OpenAPI spec and we'll tell you how good it is.",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="en"
    className={`${roboto.variable} ${robotoMono.variable} ${ibmPlexSans.variable}`}
  >
    <head>
      {process.env.NEXT_PUBLIC_ANALYTICS_URL ? (
        <Script src={process.env.NEXT_PUBLIC_ANALYTICS_URL} />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="zuplo-banner.js"></script>
    </head>

    <Suspense>
      <PostHogPageview />
    </Suspense>
    <ModalProvider>
      <PHProvider>
        <body className="flex h-screen flex-col text-base">
          <div className="mb-5 w-full rounded-md bg-white px-14 shadow-md">
            <zuplo-banner mode="light"></zuplo-banner>
          </div>
          <div className="container mx-auto flex h-screen flex-col text-base">
            <Header />
            <div className="flex grow items-center justify-center">
              {children}
            </div>
            <Footer />
          </div>
        </body>
      </PHProvider>
    </ModalProvider>
  </html>
);

export default RootLayout;
