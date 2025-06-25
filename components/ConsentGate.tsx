"use client";
import { useState, useEffect } from "react";
import CookieBanner from "./CookieBanner";
import MarketingScripts from "./MarketingScripts";
import AdsenseScripts from "./AdsenseScripts";

export default function ConsentGate({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setConsent(document.cookie.includes("cookie_consent=true"));
  }, []);

  return (
    <>
      {consent && <MarketingScripts />}
      {consent && <AdsenseScripts />}
      <CookieBanner onAccept={() => setConsent(true)} />
      {children}
    </>
  );
} 