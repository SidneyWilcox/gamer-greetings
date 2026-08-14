import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GG's: Gamer Greetings — 3D Cyber Card Lab",
  description:
    "Create, collect, and duel with interactive 3D digital collectible gamer cards. Showcase your setup, stats, and climb the global leaderboards.",
  keywords: [
    "Gamer Greetings",
    "Gamer Card",
    "Gaming Business Card",
    "Esports Profile",
    "OBS Stream Overlay",
    "Trading Cards",
  ],
  authors: [{ name: "GG's Gamer Greetings" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "GG's: Gamer Greetings — 3D Cyber Card Lab",
    description:
      "Create, collect, and duel with interactive 3D digital collectible gamer cards.",
    url: "https://gamer-greetings-tawny.vercel.app",
    siteName: "Gamer Greetings",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "GG's Gamer Greetings Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GG's: Gamer Greetings — 3D Cyber Card Lab",
    description:
      "Create, collect, and duel with interactive 3D digital collectible gamer cards.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#08070e" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#08070e",
          color: "#ffffff",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}