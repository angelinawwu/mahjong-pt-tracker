"use client";

import { useState } from "react";
import { useSession } from "@/context/SessionContext";

export function SessionSetup() {
  const { startSession } = useSession();
  const [names, setNames] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);

  const allFilled = names.every((n) => n.trim().length > 0);

  function updateName(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev] as [string, string, string, string];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled) return;
    startSession(names);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      {/* --- Header / Title --- */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-lacquer uppercase">
          麻將 · Mahjong
        </p>
        <h1 className="font-display text-4xl text-jade">Who&apos;s playing?</h1>
        <p className="mt-3 text-sm text-ink/60">
          Enter all four names to open the table.
        </p>
      </div>

      {/* --- Player Setup Form --- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {names.map((name, i) => (
          <div key={i} className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-display text-sm text-jade/40">
              {i + 1}
            </span>
            <input
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
              maxLength={24}
              className="hover-transition w-full border border-jade/20 bg-white/70 py-3.5 pr-4 pl-10 text-ink placeholder:text-ink/30 focus:border-jade focus:ring-2 focus:ring-jade/20 focus:outline-none"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={!allFilled}
          className={`hover-transition mt-4 w-full py-3.5 font-display text-lg tracking-wide ${allFilled
              ? "bg-jade text-ivory hover:bg-jade-deep active:scale-[0.98]"
              : "cursor-not-allowed bg-ink/10 text-ink/30"
            }`}
        >
          Start session
        </button>
      </form>
    </main>
  );
}
