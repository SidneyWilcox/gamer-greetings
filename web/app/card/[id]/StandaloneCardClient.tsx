"use client";

import { useEffect, useState, use, useRef } from "react";
import { supabase } from "../../supabase";

interface GamerCard {
  id: string;
  slug?: string;
  username: string;
  bio?: string;
  hardware_gpu?: string;
  hardware_hz?: string;
  hardware_dpi?: string;
  apm: number;
  luck: number;
  salt: number;
  tilt_res?: number;
  win_rate?: number;
  clutch_rate?: number;
  hours_played?: number;
  power_level?: number;
  rank_tier?: string;
  badge: string | null;
  theme: string;
  avatar_url?: string;
  class_role?: string;
  main_game?: string;
  perks?: string[];
  discord_handle?: string;
  psn_handle?: string;
  xbox_handle?: string;
  steam_handle?: string;
  twitch_handle?: string;
}

const CLASS_ROLES = [
  { id: "DPS", label: "🎯 FRAGGER / DPS", color: "#ef4444" },
  { id: "TANK", label: "🛡️ TANK / ANCHOR", color: "#3b82f6" },
  { id: "SUPPORT", label: "💚 MEDIC / SUPPORT", color: "#22c55e" },
  { id: "IGL", label: "👑 IGL / SHOTCALLER", color: "#eab308" },
  { id: "RUNNER", label: "⚡ SPEEDRUNNER", color: "#a855f7" },
];

const AVAILABLE_PERKS: Record<string, { label: string; color: string }> = {
  headshot: { label: "🎯 Headshot Machine", color: "#ef4444" },
  grinder: { label: "☕ Late Night Grinder", color: "#c084fc" },
  openmic: { label: "🎙️ Open Mic Demon", color: "#f97316" },
  anchor: { label: "🛡️ Anchor Main", color: "#3b82f6" },
  igl: { label: "🧠 Big Brain IGL", color: "#eab308" },
  movement: { label: "⚡ Movement God", color: "#06b6d4" },
  snack: { label: "🍕 Snack & Frag", color: "#22c55e" },
};

function getStatTitle(type: "apm" | "luck" | "salt" | "tiltRes", val: number): string {
  if (type === "apm") {
    if (val > 80) return "Keyboard Shredder";
    if (val > 45) return "Rapid Tactician";
    return "Turtle Fingers";
  }
  if (type === "luck") {
    if (val > 80) return "Miracle Worker";
    if (val > 45) return "Balanced Dice";
    return "RNG Cursed";
  }
  if (type === "salt") {
    if (val > 80) return "Desk Breaker";
    if (val > 45) return "Mildly Tilted";
    return "Monk Zen";
  }
  if (type === "tiltRes") {
    if (val > 80) return "Iron Will";
    if (val > 45) return "Sturdy Focus";
    return "Glass Mental";
  }
  return "";
}

export default function StandaloneCardClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [card, setCard] = useState<GamerCard | null>(null);
  const [loading, setLoading] = useState(true);

  const [zoomScale, setZoomScale] = useState(1.25);
  const [isFlipped, setIsFlipped] = useState(false);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getCard() {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from("gamer_cards").select("*");
      if (isUuid) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id.toLowerCase());
      }

      const { data, error } = await query.single();

      if (error) {
        console.error("Error fetching card:", error);
      } else {
        setCard(data);
      }
      setLoading(false);
    }
    getCard();
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardWrapperRef.current) return;
    setIsHovered(true);
    const rect = cardWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.6 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "monospace", letterSpacing: "2px" }}>// LOADING_GAMER_CARD...</p>
      </main>
    );
  }

  if (!card) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#050505", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <h2 style={{ color: "#ef4444", letterSpacing: "2px" }}>// CARD_NOT_FOUND</h2>
        <a href="/" style={{ color: "#06b6d4", textDecoration: "none", fontSize: "14px" }}>← Back to Generator</a>
      </main>
    );
  }

  const isHolo = (card.power_level ?? 0) >= 400;

  let theme = {
    bg: "#050505",
    border: isHolo ? "2px solid #f43f5e" : "1px solid rgba(6, 182, 212, 0.5)",
    glow: isHolo ? "0 0 35px rgba(244, 63, 94, 0.45)" : "0 0 25px rgba(6, 182, 212, 0.25)",
    accent: isHolo ? "#f43f5e" : "#06b6d4",
  };

  if (card.salt > 80) {
    theme = {
      bg: "#080202",
      border: "1px solid rgba(239, 68, 68, 0.8)",
      glow: "0 0 35px rgba(239, 68, 68, 0.5)",
      accent: "#ef4444",
    };
  } else if (card.luck > 80) {
    theme = {
      bg: "#050208",
      border: "1px solid rgba(192, 132, 252, 0.6)",
      glow: "0 0 30px rgba(192, 132, 252, 0.4)",
      accent: "#c084fc",
    };
  } else if (card.apm > 80) {
    theme = {
      bg: "#020803",
      border: "1px solid rgba(34, 197, 94, 0.8)",
      glow: "0 0 30px rgba(34, 197, 94, 0.4)",
      accent: "#22c55e",
    };
  }

  const roleObj = CLASS_ROLES.find((r) => r.id === card.class_role) || CLASS_ROLES[0];
  const cardSlug = card.slug || card.id;
  const qrHex = theme.accent.replace("#", "");
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gamergreetings.vercel.app/card/${cardSlug}&color=${qrHex}&bgcolor=0a0a10`;

  return (
    <main
      style={{
        backgroundColor: theme.bg,
        minHeight: "100vh",
        color: "#ffffff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "30px 20px 80px 20px",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes holoSheenContinuous {
          0% { transform: translateX(-150%) translateY(-150%) rotate(45deg); }
          100% { transform: translateX(160%) translateY(160%) rotate(45deg); }
        }
        @keyframes floatUp1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-480px) translateX(35px); opacity: 0; }
        }
        @keyframes floatUp2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-500px) translateX(-35px); opacity: 0; }
        }
        @keyframes floatUp3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.9; }
          100% { transform: translateY(-460px) translateX(20px); opacity: 0; }
        }
        @keyframes floatUp4 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.75; }
          100% { transform: translateY(-520px) translateX(-20px); opacity: 0; }
        }
      `}</style>

      {/* Top Header Navigation */}
      <a
        href="/"
        style={{
          color: "#888",
          textDecoration: "none",
          fontSize: "12px",
          marginBottom: "20px",
          letterSpacing: "1.5px",
          fontWeight: 700,
        }}
      >
        ← BUILD YOUR OWN CARD
      </a>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            backgroundColor: "#161622",
            border: `1px solid ${theme.accent}`,
            color: "#fff",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "11px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔄 {isFlipped ? "VIEW FRONT" : "FLIP TO BACK"}
        </button>

        {/* Zoom Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#161622",
            border: `1px solid ${theme.accent}66`,
            padding: "4px 12px",
            borderRadius: "30px",
          }}
        >
          <span style={{ fontSize: "10px", color: "#aaa", fontWeight: "bold" }}>ZOOM:</span>
          {[1.0, 1.25, 1.5].map((scale) => (
            <button
              key={scale}
              onClick={() => setZoomScale(scale)}
              style={{
                backgroundColor: zoomScale === scale ? theme.accent : "#222230",
                color: zoomScale === scale ? "#000" : "#fff",
                border: "none",
                padding: "3px 6px",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {scale}x
            </button>
          ))}
        </div>
      </div>

      {/* 3D Container with Dynamic Zoom */}
      <div
        style={{
          width: `${300 * zoomScale}px`,
          height: `${500 * zoomScale}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "width 0.3s ease, height 0.3s ease",
        }}
      >
        <div
          ref={cardWrapperRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: "1200px",
            cursor: "grab",
            width: "300px",
            height: "500px",
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg) scale3d(1.02, 1.02, 1.02)`,
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* FRONT FACE */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                border: theme.border,
                boxShadow: theme.glow,
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px",
                boxSizing: "border-box",
                backgroundColor: "#111116",
              }}
            >
              {card.avatar_url && (
                <img src={card.avatar_url} alt="Card Background" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
              )}

              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,12,0.65) 0%, rgba(8,8,12,0.4) 35%, rgba(8,8,12,0.92) 80%, rgba(8,8,12,0.98) 100%)", backdropFilter: "blur(2px)", zIndex: 1 }} />

              {/* Top Row */}
              <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div>
                  <span style={{ fontSize: "9px", color: "#ddd", letterSpacing: "1.5px", textShadow: "0 1px 4px #000" }}>
                    🎮 {(card.main_game || "VALORANT").toUpperCase()}
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: "900", margin: 0, letterSpacing: "1px", wordBreak: "break-word", textShadow: "0 2px 8px #000" }}>
                    {card.username}
                  </h2>
                </div>

                {card.badge && (
                  <div style={{ backgroundColor: "rgba(0,0,0,0.6)", border: `1px solid ${theme.accent}`, padding: "3px 6px", borderRadius: "6px", fontSize: "9px", fontWeight: "bold", color: theme.accent, backdropFilter: "blur(6px)" }}>
                    {card.badge}
                  </div>
                )}
              </div>

              {/* Middle Content */}
              <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto", marginBottom: "8px" }}>
                <div style={{ backgroundColor: isHolo ? "rgba(244,63,94,0.3)" : "rgba(0,0,0,0.6)", border: isHolo ? "1px solid rgba(244,63,94,0.7)" : "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(8px)" }}>
                  <div>
                    <span style={{ fontSize: "8px", color: "#ccc", letterSpacing: "1px", display: "block" }}>POWER LEVEL</span>
                    <span style={{ fontSize: "16px", fontWeight: "900", color: isHolo ? "#f43f5e" : "#06b6d4" }}>
                      ⚡ {card.power_level ?? 100}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "8px", color: "#aaa", display: "block" }}>RANK TIER</span>
                    <span style={{ fontSize: "9px", fontWeight: "bold", color: "#fff" }}>{card.rank_tier ?? "BRONZE NOOB"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.65)", border: `1px solid ${roleObj.color}`, color: roleObj.color, padding: "3px 6px", borderRadius: "6px", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", backdropFilter: "blur(6px)" }}>
                    {roleObj.label}
                  </div>
                  {card.hours_played && (
                    <span style={{ fontSize: "9px", color: "#fff", fontFamily: "monospace", textShadow: "0 1px 4px #000" }}>
                      ⏳ {card.hours_played.toLocaleString()} hrs
                    </span>
                  )}
                </div>

                {card.perks && card.perks.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {card.perks.map((pId) => {
                      const perk = AVAILABLE_PERKS[pId];
                      if (!perk) return null;
                      return (
                        <div key={pId} style={{ fontSize: "8px", fontWeight: "bold", color: perk.color, backgroundColor: "rgba(0,0,0,0.6)", border: `1px solid ${perk.color}88`, borderRadius: "4px", padding: "2px 6px", backdropFilter: "blur(4px)" }}>
                          {perk.label}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: "4px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center", backdropFilter: "blur(6px)" }}>
                      <span style={{ fontSize: "7px", color: "#aaa", display: "block" }}>WIN RATE</span>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e" }}>{card.win_rate ?? 50}%</span>
                    </div>
                    <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: "4px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center", backdropFilter: "blur(6px)" }}>
                      <span style={{ fontSize: "7px", color: "#aaa", display: "block" }}>CLUTCH</span>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#eab308" }}>{card.clutch_rate ?? 50}%</span>
                    </div>
                  </div>

                  <div style={{ width: "60px", backgroundColor: "rgba(10, 10, 16, 0.85)", border: `1px solid ${theme.accent}`, boxShadow: `0 0 10px ${theme.accent}44`, borderRadius: "6px", padding: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
                    <img src={qrCodeUrl} alt="Gamer QR" style={{ width: "42px", height: "42px", borderRadius: "3px" }} />
                    <span style={{ fontSize: "6px", color: theme.accent, marginTop: "2px", fontWeight: "bold", letterSpacing: "0.5px" }}>SCAN</span>
                  </div>
                </div>
              </div>

              {/* Front Bars */}
              <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: "5px" }}>
                {[
                  { name: `APM • ${getStatTitle("apm", card.apm)}`, val: card.apm, col: "#06b6d4" },
                  { name: `LUCK • ${getStatTitle("luck", card.luck)}`, val: card.luck, col: "#c084fc" },
                  { name: `SALT • ${getStatTitle("salt", card.salt)}`, val: card.salt, col: "#ef4444" },
                  { name: `TILT RES • ${getStatTitle("tiltRes", card.tilt_res ?? 50)}`, val: card.tilt_res ?? 50, col: "#38bdf8" },
                ].map((bar) => (
                  <div key={bar.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7.5px", color: "#ccc", marginBottom: "2px", textShadow: "0 1px 2px #000" }}>
                      <span>{bar.name}</span>
                      <span>{bar.val}%</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${bar.val}%`, height: "100%", backgroundColor: bar.col }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BACK FACE */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                border: theme.border,
                boxShadow: theme.glow,
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px",
                boxSizing: "border-box",
                backgroundColor: "#0d0d14",
                backgroundImage: "radial-gradient(#1c1c2b 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            >
              <div style={{ borderBottom: "1px solid #28283c", paddingBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", color: theme.accent, letterSpacing: "2px", fontWeight: "bold" }}>
                    // DOSSIER & RIG SPECS
                  </span>
                  <span style={{ fontSize: "8px", color: "#666", fontFamily: "monospace" }}>
                    SN: #{card.power_level ?? 100}94
                  </span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "900", margin: "4px 0 0 0", color: "#fff" }}>
                  {card.username}
                </h3>
              </div>

              <div style={{ backgroundColor: "#14141e", border: "1px solid #242436", borderRadius: "8px", padding: "10px" }}>
                <span style={{ fontSize: "8px", color: "#888", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>
                  PLAYER MOTTO / LORE
                </span>
                <p style={{ fontSize: "11px", color: "#ddd", margin: 0, fontStyle: "italic", lineHeight: "1.4" }}>
                  &ldquo;{card.bio || "Clutch or kick. Always clicking heads."}&rdquo;
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "8px", color: "#888", letterSpacing: "1px" }}>
                  BATTLESTATION HARDWARE
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <div style={{ backgroundColor: "#14141e", border: "1px solid #242436", borderRadius: "6px", padding: "6px" }}>
                    <span style={{ fontSize: "7px", color: "#666", display: "block" }}>GPU</span>
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: "#06b6d4" }}>{card.hardware_gpu || "RTX 3070"}</span>
                  </div>
                  <div style={{ backgroundColor: "#14141e", border: "1px solid #242436", borderRadius: "6px", padding: "6px" }}>
                    <span style={{ fontSize: "7px", color: "#666", display: "block" }}>REFRESH</span>
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: "#c084fc" }}>{card.hardware_hz || "240Hz"}</span>
                  </div>
                </div>
                <div style={{ backgroundColor: "#14141e", border: "1px solid #242436", borderRadius: "6px", padding: "6px" }}>
                  <span style={{ fontSize: "7px", color: "#666", display: "block" }}>SENSITIVITY</span>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#22c55e" }}>{card.hardware_dpi || "800 DPI"}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {[
                  { icon: "👾", name: "Discord", val: card.discord_handle },
                  { icon: "🎮", name: "PSN", val: card.psn_handle },
                  { icon: "🟢", name: "Xbox", val: card.xbox_handle },
                  { icon: "⚙️", name: "Steam", val: card.steam_handle },
                  { icon: "💜", name: "Twitch", val: card.twitch_handle },
                ]
                  .filter((h) => h.val)
                  .map((h) => (
                    <div key={h.name} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#14141e", border: "1px solid #242436", padding: "3px 6px", borderRadius: "4px", fontSize: "8px" }}>
                      <span>{h.icon}</span>
                      <span style={{ color: "#888" }}>{h.name}:</span>
                      <span style={{ color: "#fff", fontWeight: "bold" }}>{h.val}</span>
                    </div>
                  ))}
              </div>

              <div style={{ borderTop: "1px solid #28283c", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "7px", color: "#666", letterSpacing: "1px" }}>
                  OFFICIAL GG CYBER RECORD
                </span>
                <div style={{ width: "24px", height: "14px", borderRadius: "3px", background: "linear-gradient(45deg, #f43f5e, #06b6d4, #eab308)", opacity: 0.8 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}