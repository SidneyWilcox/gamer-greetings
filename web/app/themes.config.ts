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
  particleColors: string[];
}

export const VAULT_DROPS: VaultTheme[] = [
  {
    id: "blood_moon_halloween",
    name: "🎃 BLOOD MOON '26",
    price: "$2.99",
    stripeLink: "https://buy.stripe.com/bJe6oAaB4alO1ne9DJefC04",
    availableUntil: "2026-11-01T23:59:59Z",
    accent: "#ff3b00",
    bg: "#060101",
    border: "2px solid #ff3b00",
    glow: "0 0 45px rgba(255, 59, 0, 0.75)",
    badge: "🎃 HALLOWEEN '26",
    description: "Limited Vault Drop: Haunted Jack-O-Lantern glow, blood-orange glitch border, and ember particle aura.",
    particleColors: ["#ff3b00", "#ea580c", "#7f1d1d", "#facc15"],
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
    particleColors: ["#38bdf8", "#06b6d4", "#67e8f9", "#ffffff"],
  },
];