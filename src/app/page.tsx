"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "@/context/SessionContext";
import { SessionSetup } from "@/components/SessionSetup";
import { PlayScreen } from "@/components/PlayScreen";
import { SessionSummary } from "@/components/SessionSummary";
import { LoadingScreen } from "@/components/LoadingScreen";

function AppShell() {
  const { session } = useSession();

  if (!session) return <SessionSetup />;
  if (session.status === "ended") return <SessionSummary />;
  return <PlayScreen />;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </>
  );
}
