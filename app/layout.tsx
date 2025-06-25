// app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
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
      <body className="min-h-screen flex flex-col bg-spacex text-white">
        <ConsentGate>
          <Providers>
            <PasswordSetupRedirect />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
        </ConsentGate>
      </body>
    </html>
  );
}
