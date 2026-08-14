"use client";

import { useEffect, useState, use, useRef } from "react";
import { supabase } from "../../supabase";

interface GamerCard {
  id: string;
  slug?: string;
  username: string;
  apm: number;
  luck: number;
  salt: number;
  win_rate?: number;
  clutch_rate?: number;
  hours_played?: number;
  power_level?: number;
  rank_tier?: string;
  badge: string | null;
  theme: string;
  avatar_url?: string;
  class_role?: string;
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

export default function StandaloneCardClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [card, setCard] = useState<GamerCard | null>(null);
  const [loading, setLoading] = useState(true);

  // 3D Parallax & Hover State
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

  const handleCardClick = () => {
    setIsHovered((prev) => !prev);
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

  const isHolo = (card.power_level ?? 0) >= 380;

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
        justifyContent: "center",
        padding: "40px 20px",
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

      <a href="/" style={{ color: "#888", textDecoration: "none", fontSize: "12px", marginBottom: "20px", letterSpacing: "1px" }}>
        ← BUILD YOUR OWN CARD
      </a>

      {/* 3D Perspective Container */}
      <div
        ref={cardWrapperRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          perspective: "1000px",
          cursor: "grab",
        }}
      >
        <div
          style={{
            width: "300px",
            height: "500px",
            border: theme.border,
            boxShadow: theme.glow,
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "20px",
            boxSizing: "border-box",
            backgroundColor: "#111116",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: tilt.x === 0 && tilt.y === 0 ? "all 0.5s ease-out" : "transform 0.1s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {card.avatar_url && (
            <img
              src={card.avatar_url}
              alt="Card Background"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(8,8,12,0.65) 0%, rgba(8,8,12,0.4) 35%, rgba(8,8,12,0.92) 80%, rgba(8,8,12,0.98) 100%)",
              backdropFilter: "blur(2px)",
              zIndex: 1,
            }}
          />

          {/* Dense Floating Particles */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
            <div style={{ position: "absolute", bottom: "-10px", left: "15%", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#06b6d4", boxShadow: "0 0 8px #06b6d4", animation: "floatUp1 3.2s infinite linear" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "40%", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#c084fc", boxShadow: "0 0 10px #c084fc", animation: "floatUp2 4.0s infinite linear 0.6s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "70%", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#f43f5e", boxShadow: "0 0 8px #f43f5e", animation: "floatUp3 3.0s infinite linear 1.2s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "88%", width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "floatUp4 3.6s infinite linear 0.4s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "28%", width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#eab308", boxShadow: "0 0 6px #eab308", animation: "floatUp3 4.2s infinite linear 1.8s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "52%", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#ec4899", boxShadow: "0 0 8px #ec4899", animation: "floatUp1 3.5s infinite linear 2.2s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "6%", width: "2px", height: "2px", borderRadius: "50%", backgroundColor: "#06b6d4", boxShadow: "0 0 4px #06b6d4", animation: "floatUp2 2.8s infinite linear 1.5s" }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "82%", width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#ffffff", boxShadow: "0 0 8px #ffffff", animation: "floatUp4 3.1s infinite linear 0.9s" }} />
          </div>

          {/* Continuous Holographic Sheen on Hover / Click */}
          {isHovered && (
            <div
              style={{
                position: "absolute",
                top: "-60%",
                left: "-60%",
                width: "220%",
                height: "220%",
                background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.25) 42%, rgba(244,63,94,0.55) 47%, rgba(6,182,212,0.55) 50%, rgba(192,132,252,0.55) 53%, rgba(234,179,8,0.45) 57%, transparent 75%)",
                pointerEvents: "none",
                zIndex: 3,
                animation: "holoSheenContinuous 1.8s infinite linear",
              }}
            />
          )}

          {/* Glare Reflection */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, rgba(255,255,255,0) 65%)`,
              mixBlendMode: "overlay",
              pointerEvents: "none",
              zIndex: 4,
              transition: "opacity 0.2s ease",
            }}
          />

          <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <div>
              <span style={{ fontSize: "9px", color: "#ddd", letterSpacing: "1.5px", textShadow: "0 1px 4px #000" }}>
                // GAMER_CARD
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: "900", margin: 0, letterSpacing: "1px", wordBreak: "break-word", textShadow: "0 2px 8px #000" }}>
                {card.username}
              </h2>
            </div>

            {card.badge && (
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  border: `1px solid ${theme.accent}`,
                  padding: "3px 6px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: "bold",
                  color: theme.accent,
                  backdropFilter: "blur(6px)",
                }}
              >
                {card.badge}
              </div>
            )}
          </div>

          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto", marginBottom: "8px" }}>
            <div
              style={{
                backgroundColor: isHolo ? "rgba(244,63,94,0.3)" : "rgba(0,0,0,0.6)",
                border: isHolo ? "1px solid rgba(244,63,94,0.7)" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "6px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(8px)",
              }}
            >
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
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.65)",
                  border: `1px solid ${roleObj.color}`,
                  color: roleObj.color,
                  padding: "3px 6px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  backdropFilter: "blur(6px)",
                }}
              >
                {roleObj.label}
              </div>
              {card.hours_played && (
                <span style={{ fontSize: "9px", color: "#fff", fontFamily: "monospace", textShadow: "0 1px 4px #000" }}>
                  ⏳ {card.hours_played.toLocaleString()} hrs
                </span>
              )}
            </div>

            {/* Quick Metrics Badges & QR Code */}
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

              <div
                style={{
                  width: "60px",
                  backgroundColor: "rgba(10, 10, 16, 0.85)",
                  border: `1px solid ${theme.accent}`,
                  boxShadow: `0 0 10px ${theme.accent}44`,
                  borderRadius: "6px",
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(6px)",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="Gamer QR"
                  style={{ width: "42px", height: "42px", borderRadius: "3px" }}
                />
                <span style={{ fontSize: "6px", color: theme.accent, marginTop: "2px", fontWeight: "bold", letterSpacing: "0.5px" }}>
                  SCAN
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {[
                { icon: "👾", name: "Discord", val: card.discord_handle },
                { icon: "🎮", name: "PSN", val: card.psn_handle },
                { icon: "🟢", name: "Xbox", val: card.xbox_handle },
                { icon: "⚙️", name: "Steam", val: card.steam_handle },
                { icon: "💜", name: "Twitch", val: twitch ?? card.twitch_handle },
              ]
                .filter((h) => h.val)
                .map((h) => (
                  <div
                    key={h.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "8px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span>{h.icon}</span>
                    <span style={{ color: "#bbb" }}>{h.name}:</span>
                    <span style={{ color: "#fff", fontWeight: "bold" }}>{h.val}</span>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              { name: "APM", val: card.apm, col: "#06b6d4" },
              { name: "LUCK", val: luck ?? card.luck, col: "#c084fc" },
              { name: "SALT", val: card.salt, col: "#ef4444" },
            ].map((bar) => (
              <div key={bar.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#ccc", marginBottom: "2px", textShadow: "0 1px 2px #000" }}>
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
      </div>
    </main>
  );
}