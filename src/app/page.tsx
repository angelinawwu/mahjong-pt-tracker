"use client";

import { SessionProvider, useSession } from "@/context/SessionContext";
import { SessionSetup } from "@/components/SessionSetup";
import { PlayScreen } from "@/components/PlayScreen";
import { SessionSummary } from "@/components/SessionSummary";

function AppShell() {
  const { session } = useSession();

  if (!session) return <SessionSetup />;
  if (session.status === "ended") return <SessionSummary />;
  return <PlayScreen />;
}

export default function Home() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}
