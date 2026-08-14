import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Gamer Card Social Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://txprrkhnmfxzmvfvnaal.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_nc6RdPZqPJ_nIecXSvDhuA_R51Xn";

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Check if identifier is UUID or vanity slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase.from("gamer_cards").select("*");
  if (isUuid) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id.toLowerCase());
  }

  const { data: card } = await query.single();

  const username = card?.username || "ANONYMOUS";
  const apm = card?.apm ?? 50;
  const salt = card?.salt ?? 50;
  const winRate = card?.win_rate ?? 50;
  const clutchRate = card?.clutch_rate ?? 50;
  const powerLevel = card?.power_level ?? 100;
  const rankTier = card?.rank_tier ?? "BRONZE NOOB";
  const role = card?.class_role || "DPS";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#050505",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "1120px",
            height: "550px",
            backgroundColor: "#111116",
            border: "2px solid #06b6d4",
            borderRadius: "24px",
            padding: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 0 50px rgba(6, 182, 212, 0.3)",
          }}
        >
          {/* Left Column: Gamer Info & Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            <div style={{ color: "#666", fontSize: "16px", letterSpacing: "3px" }}>
              // GAMER_GREETINGS
            </div>
            <div style={{ fontSize: "52px", fontWeight: "900", color: "#06b6d4", letterSpacing: "1px" }}>
              {username}
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: "rgba(244, 63, 94, 0.2)",
                  border: "1px solid #f43f5e",
                  color: "#f43f5e",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ⚡ {powerLevel} PWR
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#aaa",
                }}
              >
                {rankTier}
              </div>
            </div>
            <div style={{ fontSize: "20px", color: "#22c55e", fontWeight: "bold", marginTop: "8px" }}>
              ROLE: {role}
            </div>
          </div>

          {/* Right Column: Core Stat Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "450px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#aaa", marginBottom: "6px" }}>
                <span>ACTIONS PER MINUTE (APM)</span>
                <span style={{ color: "#06b6d4", fontWeight: "bold" }}>{apm}%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#222", borderRadius: "6px" }}>
                <div style={{ width: `${apm}%`, height: "100%", backgroundColor: "#06b6d4", borderRadius: "6px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#aaa", marginBottom: "6px" }}>
                <span>WIN RATE</span>
                <span style={{ color: "#22c55e", fontWeight: "bold" }}>{winRate}%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#222", borderRadius: "6px" }}>
                <div style={{ width: `${winRate}%`, height: "100%", backgroundColor: "#22c55e", borderRadius: "6px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#aaa", marginBottom: "6px" }}>
                <span>CLUTCH RATE</span>
                <span style={{ color: "#eab308", fontWeight: "bold" }}>{clutchRate}%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#222", borderRadius: "6px" }}>
                <div style={{ width: `${clutchRate}%`, height: "100%", backgroundColor: "#eab308", borderRadius: "6px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#aaa", marginBottom: "6px" }}>
                <span>SALT LEVEL</span>
                <span style={{ color: "#ef4444", fontWeight: "bold" }}>{salt}%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#222", borderRadius: "6px" }}>
                <div style={{ width: `${salt}%`, height: "100%", backgroundColor: "#ef4444", borderRadius: "6px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}