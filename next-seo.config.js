/** @type {import('next-seo').DefaultSeoProps} */
module.exports = {
  titleTemplate: "%s | Interstellar Nerd",
  defaultTitle: "Interstellar Nerd",
  description: "Explore the cosmos of knowledge—space tech, science deep dives, and community discussions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.SITE_URL || "https://your-domain.com",
    site_name: "Interstellar Nerd",
    images: [
      {
        url: `${process.env.SITE_URL || "https://your-domain.com"}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Interstellar Nerd",
      },
    ],
  },
  twitter: {
    handle: "@YourTwitterHandle",
    site: "@YourTwitterHandle",
    cardType: "summary_large_image",
  },
};
