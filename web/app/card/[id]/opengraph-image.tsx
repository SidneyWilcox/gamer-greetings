import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Gamer Greetings Card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let query = supabase.from("gamer_cards").select("*");
  if (isUuid) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id.toLowerCase());
  }

  const { data: card } = await query.single();

  const username = card?.username || "GAMER";
  const powerLevel = card?.power_level ?? 100;
  const rankTier = card?.rank_tier || "BRONZE NOOB";
  const classRole = card?.class_role || "DPS";
  const winRate = card?.win_rate ?? 50;
  const clutchRate = card?.clutch_rate ?? 50;
  const hoursPlayed = (card?.hours_played ?? 0).toLocaleString();

  const isApex = powerLevel >= 380;
  const accentColor = isApex ? "#f43f5e" : "#06b6d4";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#08080c",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Left Column: Player Bio & Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            maxWidth: "650px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 20,
                color: accentColor,
                letterSpacing: 4,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              // GAMER GREETINGS
            </span>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: 2,
                margin: 0,
                color: "#ffffff",
              }}
            >
              {username}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 15,
                gap: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: "#161622",
                  border: `2px solid ${accentColor}`,
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: accentColor,
                }}
              >
                {classRole}
              </div>
              <span style={{ fontSize: 20, color: "#8888aa" }}>
                ⏳ {hoursPlayed} hrs logged
              </span>
            </div>
          </div>

          {/* Stats Badges */}
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#12121c",
                border: "1px solid #28283c",
                borderRadius: 12,
                padding: "16px 24px",
              }}
            >
              <span style={{ fontSize: 14, color: "#8888aa" }}>WIN RATE</span>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#22c55e" }}>
                {winRate}%
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#12121c",
                border: "1px solid #28283c",
                borderRadius: 12,
                padding: "16px 24px",
              }}
            >
              <span style={{ fontSize: 14, color: "#8888aa" }}>CLUTCH RATE</span>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#eab308" }}>
                {clutchRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Power Badge Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#12121c",
            border: `3px solid ${accentColor}`,
            borderRadius: 24,
            padding: "40px 50px",
            width: "360px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 16, color: "#8888aa", letterSpacing: 2 }}>
            POWER LEVEL
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: accentColor,
              margin: "8px 0",
            }}
          >
            ⚡ {powerLevel}
          </span>
          <div
            style={{
              backgroundColor: isApex ? "rgba(244,63,94,0.2)" : "#1c1c2a",
              border: `1px solid ${accentColor}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 16,
              fontWeight: 800,
              color: "#ffffff",
              marginTop: 10,
            }}
          >
            {rankTier}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}