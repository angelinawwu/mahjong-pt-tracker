"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MahjongTile3D } from "./MahjongTile3D";
import { generateHandTiles } from "@/lib/handGenerator";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [tiles, setTiles] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Generate a random hand and pick first 6 tiles for the loading animation
    const { hand } = generateHandTiles([]);
    setTiles(hand.slice(0, 6));
  }, []);

  useEffect(() => {
    if (tiles.length === 0) return;

    // The sequence steps from 0 to 6.
    // 0: [0]
    // 1: [0, 1]
    // 2: [0, 1, 2]
    // 3: [1, 2, 3]
    // 4: [2, 3, 4]
    // 5: [3, 4, 5]
    // 6: Done

    if (step >= 6) {
      // Add a slight delay before triggering onComplete for the final tiles to tilt out
      const timeout = setTimeout(onComplete, 800);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 600); // 600ms between each tile entering

    return () => clearTimeout(timer);
  }, [step, tiles, onComplete]);

  // Determine which tiles should be visible based on the step
  // When step = N, tile N is entering. Tiles before N-2 should be exiting.
  // So visible tiles are from Math.max(0, step - 2) to step (inclusive).
  const visibleTiles = tiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ index }) => index <= step && index >= step - 2);

  if (tiles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sand">
      <div
        className="flex items-center justify-center gap-2 sm:gap-4 h-48"
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="popLayout">
          {visibleTiles.map(({ tile, index }) => (
            <motion.div
              key={`${tile}-${index}`}
              layout
              initial={{ opacity: 0, rotateX: 70, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -70, y: -50 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 14,
                opacity: { duration: 0.3 },
              }}
              className="w-16 sm:w-24"
              style={{ transformStyle: "preserve-3d" }}
            >
              <MahjongTile3D tile={tile} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
