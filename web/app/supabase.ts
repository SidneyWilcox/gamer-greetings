import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://txprrkhnmfxzmvfvnaal.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_nC6RdPZqPJ_n1ecXSvDhuA_R51Xn08m"; // Replace with your FULL publishable key from Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);