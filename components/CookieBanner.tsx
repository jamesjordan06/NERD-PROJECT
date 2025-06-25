"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function CookieBanner({
  onAccept,
}: {
  onAccept: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner if no consent cookie is set
    const consent = Cookies.get("cookie_consent");
    if (consent !== "true") {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    // Set a secure, SameSite=Lax cookie that expires in 1 year
    Cookies.set("cookie_consent", "true", {
      expires: 365,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    setVisible(false);
    onAccept();
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-midnight-dark text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="mb-2 sm:mb-0 text-sm">
          We use cookies to personalize content and ads, to provide social media
          features and to analyze our traffic. By clicking “Accept” you agree to
          our use of cookies.
        </p>
        <button
          onClick={acceptCookies}
          className="px-4 py-2 bg-neon text-black font-semibold rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
