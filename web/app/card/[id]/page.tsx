import type { Metadata } from "next";
import StandaloneCardClient from "./StandaloneCardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Gamer Card - ${id}`,
    description: "Check out my Gamer Greetings Card stats and linked handles!",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StandaloneCardClient params={params} />;
}