"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateHandTiles } from "@/lib/handGenerator";
import type { WinType } from "@/lib/types";
import { MahjongTile3D } from "./MahjongTile3D";

interface InteractiveHandPreviewProps {
  comboIds: string[];
  winType: WinType;
}

export function InteractiveHandPreview({ comboIds, winType }: InteractiveHandPreviewProps) {
  // Use state to store the generated hand to avoid hydration mismatch 
  // if we used Math.random() directly on the first render.
  const [handData, setHandData] = useState<{ hand: string[], flowers: string[] } | null>(null);

  // We only want to regenerate when comboIds change. 
  // We use stringified comboIds to compare.
  const comboIdsString = comboIds.sort().join(',');

  useEffect(() => {
    setHandData(generateHandTiles(comboIds));
  }, [comboIdsString, comboIds]);

  if (!handData) return null;

  const { hand, flowers } = handData;
  const isDiscard = winType === "discard";

  // If we have 14 tiles and it's a discard, separate the last one
  const mainTiles = isDiscard && hand.length === 14 ? hand.slice(0, 13) : hand;
  const winningTile = isDiscard && hand.length === 14 ? hand[13] : null;

  return (
    <div className="w-full flex flex-col gap-4 border border-ink/10 bg-white/70 p-[21px] overflow-hidden" style={{ perspective: "1000px" }}>
      <p className="font-display text-lg text-jade">Hand preview</p>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={comboIdsString}
          initial={{ opacity: 0, rotateX: -60, y: -20 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: 60, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 14,
            opacity: { duration: 0.3 },
          }}
          className="w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex w-full items-end gap-[2px] sm:gap-1 mb-2">
            {mainTiles.map((tile, i) => (
              <div key={`${tile}-${i}`} className="flex-1 min-w-0">
                <MahjongTile3D tile={tile} />
              </div>
            ))}
            {winningTile && (
              <>
                <div className="w-px self-stretch border-l-2 border-jade/20 ml-1 sm:ml-3"></div>
                <div className="flex-1 min-w-0 ml-1 sm:ml-3">
                  <MahjongTile3D tile={winningTile} />
                </div>
              </>
            )}
          </div>

          {flowers.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
              <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] text-lacquer uppercase">Flowers</span>
              <div className="flex w-full items-end gap-[2px] sm:gap-1">
                {Array.from({ length: mainTiles.length }).map((_, i) => {
                  const f = flowers[i];
                  return (
                    <div key={`flower-${i}`} className="flex-1 min-w-0">
                      {f && (
                        <MahjongTile3D tile={f} className="opacity-90" />
                      )}
                    </div>
                  );
                })}
                {/* Match winning tile spacing so the flowers align perfectly with the hand tiles */}
                {winningTile && (
                  <>
                    <div className="w-px self-stretch border-l-2 border-transparent ml-1 sm:ml-3"></div>
                    <div className="flex-1 min-w-0 ml-1 sm:ml-3"></div>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
