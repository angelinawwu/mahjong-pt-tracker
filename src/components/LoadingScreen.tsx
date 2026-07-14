"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MahjongTile3D } from "./MahjongTile3D";
import { generateHandTiles } from "@/lib/handGenerator";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_PHRASES = [
  "Washing the tiles...",
  "Building the wall...",
  "Rearranging tiles...",
  "Summoning thirteen orphans...",
  "Waiting for the wind...",
  "Dealing the hands...",
  "Rolling the dice...",
  "Sorting the tiles...",
];

const textVariants = {
  initial: { opacity: 0, rotateX: 60, filter: "blur(8px)", y: 15 },
  animate: { opacity: 1, rotateX: 0, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, rotateX: -60, filter: "blur(8px)", y: -15 },
};

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [tiles, setTiles] = useState<string[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Generate a random hand and pick first 6 tiles for the loading animation
    const { hand } = generateHandTiles([]);
    setTiles(hand.slice(0, 6));

    // Choose 3 random phrases from the list
    const shuffled = [...LOADING_PHRASES].sort(() => 0.5 - Math.random());
    setSelectedPhrases(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (tiles.length === 0) return;

    // The sequence steps from 0 to 5.
    // 0: [0]
    // 1: [0, 1]
    // 2: [0, 1, 2]
    // 3: [1, 2, 3]
    // 4: [2, 3, 4]
    // 5: [3, 4, 5] (Ends here with 3 tiles visible)

    if (step >= 5) {
      // Keep tiles 3, 4, and 5 visible, wait for the final tile transition to finish, then complete.
      const timeout = setTimeout(onComplete, 1200);
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

  if (tiles.length === 0 || selectedPhrases.length === 0) return null;

  // Each phrase lasts 2 tile transitions (e.g. phrase 0 for step 0/1, phrase 1 for step 2/3, phrase 2 for step 4/5)
  const currentPhrase = selectedPhrases[Math.min(Math.floor(step / 2), 2)];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sand">
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

      <div className="flex flex-col items-center justify-center mt-8 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-lacquer uppercase mb-2">
          Loading
        </p>
        <div className="h-8 flex items-center justify-center" style={{ perspective: "600px" }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentPhrase}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
              className="font-display text-2xl text-jade"
              style={{ transformStyle: "preserve-3d" }}
            >
              {currentPhrase}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
