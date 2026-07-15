"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence mode="sync">
      {isLoading ? (
        <LoadingScreen key="loading-screen" onComplete={() => setIsLoading(false)} />
      ) : (
        <motion.div
          key="app-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <SessionProvider>
            <AppShell />
          </SessionProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
