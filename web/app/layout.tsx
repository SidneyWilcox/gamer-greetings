import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gamer Greetings",
  description: "Dynamic Gamer Card Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#050505" }}>
        {children}
      </body>
    </html>
  );
}