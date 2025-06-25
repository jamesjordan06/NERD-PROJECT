"use client";

import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept marketing cookies"
      enableDeclineButton
      declineButtonText="Necessary only"
      cookieName="interstellar-consent"
      style={{ background: "#0A1F2E" }}
      buttonStyle={{ color: "#fff", background: "#9B59B6", borderRadius: "8px" }}
      declineButtonStyle={{ color: "#fff", background: "#333", borderRadius: "8px" }}
    >
      We use cookies to personalize content and ads.
    </CookieConsent>
  );
}
