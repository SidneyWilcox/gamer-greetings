export interface VaultTheme {
  id: string;
  name: string;
  price: string;
  stripeLink: string;
  availableUntil: string; // ISO 8601 string
  accent: string;
  bg: string;
  border: string;
  glow: string;
  badge: string;
  description: string;
}

export const VAULT_DROPS: VaultTheme[] = [
  {
    id: "blood_moon",
    name: "🩸 Blood Moon Glitch",
    price: "$2.99",
    stripeLink: "https://buy.stripe.com/example_blood_moon",
    availableUntil: "2026-11-01T23:59:59Z",
    accent: "#ef4444",
    bg: "#080202",
    border: "2px solid #ef4444",
    glow: "0 0 40px rgba(239, 68, 68, 0.65)",
    badge: "🩸 VAULT '26",
    description: "Limited-edition crimson glitch border and dark particle shaders.",
  },
  {
    id: "cyber_frost",
    name: "❄️ Cyber Blizzard",
    price: "$2.99",
    stripeLink: "https://buy.stripe.com/example_cyber_frost",
    availableUntil: "2026-12-31T23:59:59Z",
    accent: "#38bdf8",
    bg: "#02070c",
    border: "2px solid #38bdf8",
    glow: "0 0 40px rgba(56, 189, 248, 0.65)",
    badge: "❄️ FROST '26",
    description: "Sub-zero frosted glass edges with icy blue holographic particle sheen.",
  },
];