import type { Metadata } from "next";
import { Google_Sans, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
// import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { NavigationProgress } from "@/components/NavigationProgress";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["vietnamese"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["vietnamese"],
});

export const metadata: Metadata = {
  title: "itHUS - From Big DragoN",
  description:
    "itHUS is a summary site for knowledge in various subjects at the Faculty of Mathematics, Mechanics and Informatics - Hanoi University of Science (HUS-VNU)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${googleSans.className} ${jetBrainsMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <NavigationProgress />
        <Navbar />
        <main className="pt-16 min-h-screen overflow-x-hidden">{children}</main>
        <ScrollToTop />
        <Footer />
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
