"use client";
import { useEffect } from "react";

export default function AdsenseScripts() {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2724823807720042";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);
  return null;
} 