// app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Banner from "./components/Banner";
import Footer from "../components/Footer";
import type { Metadata } from "next";
import ConsentGate from "../components/ConsentGate";
import PasswordSetupRedirect from "../components/PasswordSetupRedirect";

export const metadata: Metadata = {
  title: "Interstellar Nerd",
  description: "Explore the cosmos of knowledge",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/logo.svg" as="image" />
      </head>
      <body className="bg-spacex text-spacex-gray font-sans min-h-screen">
        <ConsentGate>
          <Providers>
            <PasswordSetupRedirect />
            <Banner />
            <main className="min-h-[80vh] py-12 px-2 sm:px-0">{children}</main>
            <Footer />
          </Providers>
        </ConsentGate>
      </body>
    </html>
  );
}
