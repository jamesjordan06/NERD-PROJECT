"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { loadGA } from "../lib/ga";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (consent === "accepted") {
      loadGA();
    }
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    Cookies.set("cookie_consent", "accepted", { expires: 365, sameSite: "Lax" });
    setVisible(false);
    loadGA();
  };

  const decline = () => {
    Cookies.set("cookie_consent", "rejected", { expires: 365, sameSite: "Lax" });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white p-4 z-50 sm:flex sm:items-center sm:justify-between space-y-2 sm:space-y-0">
      <p className="text-sm">
        We use cookies to improve your experience. See our{' '}
        <a href="/privacy-policy" className="underline">
          privacy policy
        </a>
        .
      </p>
      <div className="flex items-center space-x-2">
        <button onClick={decline} className="px-3 py-2 bg-gray-700 rounded text-sm">
          Decline
        </button>
        <button onClick={accept} className="px-3 py-2 bg-green-500 text-black rounded text-sm">
          Accept
        </button>
        <a href="/privacy-policy" className="underline text-sm ml-2 hidden sm:inline-block">
          Manage Preferences
        </a>
      </div>
    </div>
  );
}
