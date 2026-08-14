"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { toPng } from "html-to-image";
import { supabase } from "./supabase";
import { sound } from "./audio";

interface GamerCard {
  id?: string;
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
  created_at?: string;
}

const CLASS_ROLES = [
  { id: "DPS", label: "🎯 FRAGGER / DPS", color: "#ef4444" },
  { id: "TANK", label: "🛡️ TANK / ANCHOR", color: "#3b82f6" },
  { id: "SUPPORT", label: "💚 MEDIC / SUPPORT", color: "#22c55e" },
  { id: "IGL", label: "👑 IGL / SHOTCALLER", color: "#eab308" },
  { id: "RUNNER", label: "⚡ SPEEDRUNNER", color: "#a855f7" },
];

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Phoenix",
];

const LEADERBOARD_CATEGORIES = [
  { id: "power_level", label: "⚡ POWER LEVEL" },
  { id: "salt", label: "🌶️ MOST SALTY" },
  { id: "apm", label: "⌨️ HIGHEST APM" },
  { id: "win_rate", label: "🏆 WIN RATE" },
  { id: "hours_played", label: "⏳ HOURS" },
];

export default function Home() {
  const [username, setUsername] = useState("PLAYER_ONE");
  const [vanitySlug, setVanitySlug] = useState("");

  // Stats State
  const [apm, setApm] = useState(65);
  const [luck, setLuck] = useState(50);
  const [salt, setSalt] = useState(40);
  const [winRate, setWinRate] = useState(60);
  const [clutchRate, setClutchRate] = useState(45);
  const [hoursPlayed, setHoursPlayed] = useState(1250);

  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [classRole, setClassRole] = useState("DPS");

  // Audio & Toggles
  const [sfxMuted, setSfxMuted] = useState(false);
  const [discord, setDiscord] = useState("");
  const [psn, setPsn] = useState("");
  const [xbox, setXbox] = useState("");
  const [steam, setSteam] = useState("");
  const [twitch, setTwitch] = useState("");
  const [showHandles, setShowHandles] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

  // Leaderboard Filtering & Sorting State
  const [activeCategory, setActiveCategory] = useState("power_level");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [leaderboard, setLeaderboard] = useState<GamerCard[]>([]);

  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 3D Parallax Tilt & Active Hover State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const prevHoloRef = useRef(false);

  // Compute Power Level & Rank Tier
  const { powerLevel, rankTier, isHolo } = useMemo(() => {
    const hoursBonus = Math.min(Math.floor(Math.sqrt(hoursPlayed) * 2), 60);
    const score = Math.round((apm * 1.4) + (winRate * 1.8) + (clutchRate * 1.2) + hoursBonus);
    
    let tier = "BRONZE NOOB";
    if (score >= 380) tier = "🔥 APEX PREDATOR (S-TIER)";
    else if (score >= 280) tier = "💎 DIAMOND ELITE";
    else if (score >= 200) tier = "🥇 GOLD WARRIOR";
    else if (score >= 120) tier = "🥈 SILVER GRINDER";

    return { powerLevel: score, rankTier: tier, isHolo: score >= 380 };
  }, [apm, winRate, clutchRate, hoursPlayed]);

  // Trigger Power-up SFX when unlocking Apex S-Tier
  useEffect(() => {
    if (isHolo && !prevHoloRef.current) {
      sound.playPowerUp();
    }
    prevHoloRef.current = isHolo;
  }, [isHolo]);

  const toggleSound = () => {
    const nextState = !sfxMuted;
    setSfxMuted(nextState);
    sound.enabled = !nextState;
    if (!nextState) sound.playConfirm();
  };

  // Dynamic Theme Logic
  let themeName = "default";
  let theme = {
    bg: "#050505",
    border: isHolo ? "2px solid #f43f5e" : "1px solid rgba(6, 182, 212, 0.5)",
    glow: isHolo ? "0 0 35px rgba(244, 63, 94, 0.45)" : "0 0 25px rgba(6, 182, 212, 0.25)",
    accent: isHolo ? "#f43f5e" : "#06b6d4",
    badge: null as string | null,
  };

  if (salt > 80) {
    themeName = "glitch";
    theme = {
      bg: "#080202",
      border: "1px solid rgba(239, 68, 68, 0.8)",
      glow: "0 0 35px rgba(239, 68, 68, 0.5)",
      accent: "#ef4444",
      badge: "⚡ SALTY DOG",
    };
  } else if (luck > 80) {
    themeName = "cozy";
    theme = {
      bg: "#050208",
      border: "1px solid rgba(192, 132, 252, 0.6)",
      glow: "0 0 30px rgba(192, 132, 252, 0.4)",
      accent: "#c084fc",
      badge: "✨ CHAOS KING",
    };
  } else if (apm > 80) {
    themeName = "retro";
    theme = {
      bg: "#020803",
      border: "1px solid rgba(34, 197, 94, 0.8)",
      glow: "0 0 30px rgba(34, 197, 94, 0.4)",
      accent: "#22c55e",
      badge: "🤖 THE MACHINE",
    };
  }

  // 3D Parallax Mouse & Touch Handlers
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
    sound.playTick(75);
  };

  const fetchLeaderboard = async () => {
    let query = supabase.from("gamer_cards").select("*");

    if (roleFilter !== "ALL") {
      query = query.eq("class_role", roleFilter);
    }

    const { data, error } = await query
      .order(activeCategory, { ascending: false })
      .limit(10);

    if (error) console.error("Error fetching leaderboard:", error);
    else if (data) setLeaderboard(data);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeCategory, roleFilter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        sound.playConfirm();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToLeaderboard = async () => {
    setIsSaving(true);
    const cleanSlug = vanitySlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    const newCard: GamerCard = {
      username: username || "ANONYMOUS",
      slug: cleanSlug || undefined,
      apm,
      luck,
      salt,
      win_rate: winRate,
      clutch_rate: clutchRate,
      hours_played: hoursPlayed,
      power_level: powerLevel,
      rank_tier: rankTier,
      badge: theme.badge,
      theme: themeName,
      avatar_url: avatarUrl,
      class_role: classRole,
      discord_handle: discord || undefined,
      psn_handle: psn || undefined,
      xbox_handle: xbox || undefined,
      steam_handle: steam || undefined,
      twitch_handle: twitch || undefined,
    };

    const { error } = await supabase.from("gamer_cards").insert([newCard]);

    if (error) {
      console.error("Failed to save card:", error);
      if (error.code === "23505") {
        alert("That custom URL slug is already taken! Try a different one.");
      } else {
        alert("Failed to save to database.");
      }
    } else {
      sound.playConfirm();
      await fetchLeaderboard();
    }
    setIsSaving(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    sound.playExport();
    try {
      setIsHovered(false);
      setTilt({ x: 0, y: 0 });
      setGlare({ x: 50, y: 50, opacity: 0 });

      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `${username || "CARD"}-GamerGreeting.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getCardIdentifier = (card: GamerCard) => card.slug || card.id;

  const copyShareLink = (identifier: string) => {
    const shareUrl = `${window.location.origin}/card/${identifier}`;
    navigator.clipboard.writeText(shareUrl);
    sound.playConfirm();
    setCopiedId(identifier);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeRoleObj = CLASS_ROLES.find((r) => r.id === classRole) || CLASS_ROLES[0];

  // Dynamic QR Code Color
  const qrHex = theme.accent.replace("#", "");
  const liveTargetSlug = vanitySlug.trim() ? vanitySlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : (username || "player");
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gamergreetings.vercel.app/card/${liveTargetSlug}&color=${qrHex}&bgcolor=0a0a10`;

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
        transition: "all 0.4s ease",
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

      {/* Top Header & SFX Mute Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h1
          style={{
            letterSpacing: "4px",
            color: theme.accent,
            fontSize: "28px",
            fontWeight: "900",
            margin: 0,
            textShadow: `0 0 10px ${theme.accent}`,
          }}
        >
          GAMER GREETINGS
        </h1>
        <button
          onClick={toggleSound}
          title="Toggle SFX"
          style={{
            backgroundColor: "#171720",
            border: `1px solid ${sfxMuted ? "#444" : theme.accent}`,
            color: sfxMuted ? "#666" : theme.accent,
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {sfxMuted ? "🔇" : "🔊"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "32px",
          justifyContent: "center",
          alignItems: "flex-start",
          maxWidth: "980px",
          width: "100%",
        }}
      >
        {/* Control Panel */}
        <div
          style={{
            backgroundColor: "#111116",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #22222e",
            flex: "1 1 320px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Player Tag */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
              PLAYER TAG
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              style={{
                width: "100%",
                backgroundColor: "#1b1b24",
                border: `1px solid ${theme.accent}`,
                borderRadius: "8px",
                padding: "10px",
                color: "#fff",
                fontWeight: "bold",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Vanity Slug Field */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
              CUSTOM CARD SLUG (URL)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1b1b24",
                border: "1px solid #282836",
                borderRadius: "8px",
                padding: "0 10px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#666", marginRight: "4px" }}>/card/</span>
              <input
                type="text"
                placeholder="e.g. king-of-salem"
                value={vanitySlug}
                onChange={(e) => setVanitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  padding: "10px 0",
                  color: "#fff",
                  fontWeight: "bold",
                  outline: "none",
                  fontSize: "12px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
              PRIMARY CLASS ROLE
            </label>
            <select
              value={classRole}
              onChange={(e) => {
                setClassRole(e.target.value);
                sound.playTick(60);
              }}
              style={{
                width: "100%",
                backgroundColor: "#1b1b24",
                border: "1px solid #282836",
                borderRadius: "8px",
                padding: "10px",
                color: "#fff",
                fontWeight: "bold",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              {CLASS_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
              CARD BACKGROUND / ARTWORK
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              {PRESET_AVATARS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx}`}
                  onClick={() => {
                    setAvatarUrl(url);
                    sound.playTick(80);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: avatarUrl === url ? `2px solid ${theme.accent}` : "2px solid transparent",
                    backgroundColor: "#1b1b24",
                  }}
                />
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: "10px", color: "#aaa" }} />
          </div>

          {/* Sliders with Reactive Audio Ticks */}
          <span style={{ fontSize: "10px", color: "#666", letterSpacing: "1px", display: "block", margin: "12px 0 8px 0" }}>
            // CORE STATS
          </span>
          {[
            { label: "APM", val: apm, set: setApm },
            { label: "LUCK", val: luck, set: setLuck },
            { label: "SALT", val: salt, set: setSalt },
            { label: "WIN RATE", val: winRate, set: setWinRate },
            { label: "CLUTCH RATE", val: clutchRate, set: setClutchRate },
          ].map((s) => (
            <div key={s.label} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", color: "#aaa" }}>
                <span>{s.label}</span>
                <span style={{ color: theme.accent, fontWeight: "bold" }}>{s.val}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s.val}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  s.set(v);
                  sound.playTick(v);
                }}
                style={{ width: "100%", accentColor: theme.accent }}
              />
            </div>
          ))}

          {/* Hours Input */}
          <div style={{ marginTop: "12px", marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>
              HOURS PLAYED
            </label>
            <input
              type="number"
              value={hoursPlayed}
              onChange={(e) => {
                setHoursPlayed(Number(e.target.value));
                sound.playTick(50);
              }}
              style={{
                width: "100%",
                backgroundColor: "#1b1b24",
                border: "1px solid #282836",
                borderRadius: "6px",
                padding: "8px",
                color: "#fff",
                fontWeight: "bold",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* QR Code Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", backgroundColor: "#171720", padding: "8px 12px", borderRadius: "8px" }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>SHOW SCANNABLE QR CODE</span>
            <input
              type="checkbox"
              checked={showQrCode}
              onChange={(e) => {
                setShowQrCode(e.target.checked);
                sound.playTick(40);
              }}
              style={{ cursor: "pointer", accentColor: theme.accent }}
            />
          </div>

          <button
            onClick={() => {
              setShowHandles(!showHandles);
              sound.playTick(40);
            }}
            style={{
              backgroundColor: "transparent",
              color: "#888",
              border: "1px dashed #333",
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              fontSize: "11px",
              letterSpacing: "1px",
              cursor: "pointer",
              margin: "8px 0 12px 0",
            }}
          >
            {showHandles ? "▲ HIDE GAMER HANDLES" : "▼ CONNECT GAMER HANDLES"}
          </button>

          {showHandles && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", backgroundColor: "#171720", padding: "12px", borderRadius: "8px" }}>
              {[
                { label: "DISCORD", val: discord, set: setDiscord, placeholder: "User#0000 or username" },
                { label: "PSN ID", val: psn, set: setPsn, placeholder: "PlayStation ID" },
                { label: "XBOX GAMERTAG", val: xbox, set: setXbox, placeholder: "Xbox Gamertag" },
                { label: "STEAM", val: steam, set: setSteam, placeholder: "Steam Community ID" },
                { label: "TWITCH", val: twitch, set: setTwitch, placeholder: "Twitch Channel" },
              ].map((h) => (
                <div key={h.label}>
                  <label style={{ fontSize: "9px", color: "#666", display: "block" }}>{h.label}</label>
                  <input
                    type="text"
                    value={h.val}
                    placeholder={h.placeholder}
                    onChange={(e) => h.set(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "#111116",
                      border: "1px solid #282836",
                      borderRadius: "4px",
                      padding: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            <button
              onClick={handleSaveToLeaderboard}
              disabled={isSaving}
              style={{
                width: "100%",
                backgroundColor: theme.accent,
                color: "#000",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "900",
                letterSpacing: "1px",
                cursor: "pointer",
                boxShadow: `0 0 15px ${theme.accent}66`,
              }}
            >
              {isSaving ? "SAVING..." : "SAVE TO LEADERBOARD"}
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                color: "#fff",
                border: `1px solid ${theme.accent}`,
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "700",
                letterSpacing: "1px",
                cursor: "pointer",
              }}
            >
              {isExporting ? "EXPORTING..." : "DOWNLOAD CARD PNG"}
            </button>
          </div>
        </div>

        {/* 3D Perspective Wrapper */}
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
          {/* 9:16 Full-Bleed Artwork Card with 3D Tilt */}
          <div
            ref={cardRef}
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
            {/* Background Artwork */}
            {avatarUrl && (
              <img
                src={avatarUrl}
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

            {/* Dark Glass Overlay */}
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

            {/* Dense Floating Cyber Particles */}
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

            {/* Continuous Holographic Rainbow Foil Shimmer on Hover / Touch */}
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

            {/* Dynamic Parallax Glare Highlight */}
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

            {/* Top Row: Username & Badge */}
            <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <span style={{ fontSize: "9px", color: "#ddd", letterSpacing: "1.5px", textShadow: "0 1px 4px #000" }}>
                  // GAMER_CARD
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: "900", margin: 0, letterSpacing: "1px", wordBreak: "break-word", textShadow: "0 2px 8px #000" }}>
                  {username || "ANONYMOUS"}
                </h2>
              </div>

              {theme.badge && (
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
                  {theme.badge}
                </div>
              )}
            </div>

            {/* Middle Content */}
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
                    ⚡ {powerLevel}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", display: "block" }}>RANK TIER</span>
                  <span style={{ fontSize: "9px", fontWeight: "bold", color: "#fff" }}>{rankTier}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.65)",
                    border: `1px solid ${activeRoleObj.color}`,
                    color: activeRoleObj.color,
                    padding: "3px 6px",
                    borderRadius: "6px",
                    fontSize: "9px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {activeRoleObj.label}
                </div>
                <span style={{ fontSize: "9px", color: "#fff", fontFamily: "monospace", textShadow: "0 1px 4px #000" }}>
                  ⏳ {hoursPlayed.toLocaleString()} hrs
                </span>
              </div>

              {/* Quick Metrics Badges & Dynamic Colored QR Code */}
              <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: "4px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center", backdropFilter: "blur(6px)" }}>
                    <span style={{ fontSize: "7px", color: "#aaa", display: "block" }}>WIN RATE</span>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e" }}>{winRate}%</span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: "4px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center", backdropFilter: "blur(6px)" }}>
                    <span style={{ fontSize: "7px", color: "#aaa", display: "block" }}>CLUTCH</span>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#eab308" }}>{clutchRate}%</span>
                  </div>
                </div>

                {/* Scannable Dynamic QR Code */}
                {showQrCode && (
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
                )}
              </div>

              {/* Connected Handles Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {[
                  { icon: "👾", name: "Discord", val: discord },
                  { icon: "🎮", name: "PSN", val: psn },
                  { icon: "🟢", name: "Xbox", val: xbox },
                  { icon: "⚙️", name: "Steam", val: steam },
                  { icon: "💜", name: "Twitch", val: twitch },
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

            {/* Core Bar Displays */}
            <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: "5px" }}>
              {[
                { name: "APM", val: apm, col: "#06b6d4" },
                { name: "LUCK", val: luck, col: "#c084fc" },
                { name: "SALT", val: salt, col: "#ef4444" },
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
      </div>

      {/* Global Leaderboard */}
      <div
        style={{
          marginTop: "48px",
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#111116",
          borderRadius: "16px",
          border: "1px solid #22222e",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", letterSpacing: "2px", color: "#888", fontWeight: "bold", margin: 0 }}>
            // GLOBAL LEADERBOARD
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: "#666" }}>ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                sound.playTick(50);
              }}
              style={{
                backgroundColor: "#1b1b24",
                border: "1px solid #282836",
                borderRadius: "6px",
                padding: "4px 8px",
                color: "#fff",
                fontSize: "11px",
                outline: "none",
              }}
            >
              <option value="ALL">ALL CLASSES</option>
              {CLASS_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {LEADERBOARD_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  sound.playTick(70);
                }}
                style={{
                  backgroundColor: isActive ? theme.accent : "#1b1b24",
                  color: isActive ? "#000" : "#888",
                  border: isActive ? `1px solid ${theme.accent}` : "1px solid #2a2a38",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {leaderboard.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#555" }}>No cards found for this filter.</p>
          ) : (
            leaderboard.map((card, idx) => {
              const medals = ["🥇", "🥈", "🥉"];
              const rankDisplay = idx < 3 ? medals[idx] : `#${idx + 1}`;
              const identifier = getCardIdentifier(card);

              let statHighlight = `⚡ ${card.power_level ?? 100} PWR`;
              if (activeCategory === "salt") statHighlight = `🌶️ ${card.salt}% SALT`;
              else if (activeCategory === "apm") statHighlight = `⌨️ ${card.apm}% APM`;
              else if (activeCategory === "win_rate") statHighlight = `🏆 ${card.win_rate ?? 50}% WIN`;
              else if (activeCategory === "hours_played") statHighlight = `⏳ ${(card.hours_played ?? 0).toLocaleString()} hrs`;

              return (
                <div
                  key={card.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: idx === 0 ? "rgba(244,63,94,0.08)" : "#1b1b24",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: idx === 0 ? "1px solid rgba(244,63,94,0.4)" : "1px solid #2a2a38",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: idx < 3 ? "18px" : "13px", fontWeight: "900", color: "#aaa", minWidth: "24px" }}>
                      {rankDisplay}
                    </span>
                    {card.avatar_url && (
                      <img
                        src={card.avatar_url}
                        alt="Avatar"
                        style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: "bold" }}>{card.username}</span>
                        {card.slug && (
                          <span style={{ fontSize: "9px", color: theme.accent, fontFamily: "monospace" }}>
                            /{card.slug}
                          </span>
                        )}
                        {card.class_role && (
                          <span style={{ fontSize: "9px", backgroundColor: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px", color: "#aaa" }}>
                            {card.class_role}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: theme.accent, fontWeight: "bold", fontFamily: "monospace" }}>
                        {statHighlight}
                      </span>
                    </div>
                  </div>

                  {identifier && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a
                        href={`/card/${identifier}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#2a2a38",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        VIEW ↗
                      </a>
                      <button
                        onClick={() => copyShareLink(identifier!)}
                        style={{
                          fontSize: "10px",
                          backgroundColor: theme.accent,
                          color: "#000",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {copiedId === identifier ? "COPIED!" : "COPY LINK"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}