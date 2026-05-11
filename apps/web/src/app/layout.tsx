import "./globals.css";

import { Metadata } from "next";
import { Fira_Code, Inter, Readex_Pro } from "next/font/google";
import { Suspense } from "react";

import { ModalProvider, PHProvider, PostHogPageview } from "./providers";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const readexPro = Readex_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-readex-pro",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-fira-code",
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
    className={`${inter.variable} ${readexPro.variable} ${firaCode.variable}`}
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
        <body className="bg-bg-subtle text-fg flex min-h-screen flex-col antialiased">
          <div className="border-border bg-bg w-full border-b">
            <zuplo-banner mode="light"></zuplo-banner>
          </div>
          <Header />
          <main className="flex w-full grow flex-col py-8 md:py-12">
            {children}
          </main>
          <Footer />
        </body>
      </PHProvider>
    </ModalProvider>
  </html>
);

export default RootLayout;
