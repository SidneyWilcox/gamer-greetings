import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import StandaloneCardClient from "./StandaloneCardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
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

  const title = card ? `${card.username} | Gamer Greetings Card` : "Gamer Greetings Card";
  const desc = card
    ? `⚡ Power Level: ${card.power_level ?? 100} (${card.rank_tier ?? "Gamer"}) • Win Rate: ${card.win_rate ?? 50}% • Clutch: ${card.clutch_rate ?? 50}% • ${card.hours_played ?? 0} hrs played. View full 3D interactive card & stats!`
    : "Check out this custom 3D Gamer Greetings collectible card!";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export default function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StandaloneCardClient params={params} />;
}