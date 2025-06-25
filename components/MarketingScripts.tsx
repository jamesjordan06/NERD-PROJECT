"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function MarketingScripts() {
  useEffect(() => {
    // Google Analytics
    const GA_ID = 'G-RZN3Z16TN3';
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.append(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", GA_ID);
  }, []);

  return null;
}
