import { HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface MahjongTile3DProps extends HTMLMotionProps<"div"> {
  tile: string;
}

export function MahjongTile3D({ tile, className, ...props }: MahjongTile3DProps) {
  return (
    <div
      style={{ containerType: "inline-size", perspective: "1000px" }}
      className={`w-full aspect-[3/4] ${className || ""}`.trim()}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(25deg) rotateY(-20deg) rotateZ(5deg)" }}
        >
          {/* Shadow */}
          <div
            className="absolute inset-0 bg-black/30 blur-[8px] rounded-[6px]"
            style={{ transform: "translateZ(-25cqi) translateY(10cqi) translateX(-5cqi) scale(0.95)" }}
          />

          {/* Front */}
          <div
            className="absolute inset-0 rounded-[6px] overflow-hidden bg-white"
            style={{ transform: "translateZ(33.33cqi)" }}
          >
            <img
              src={`/tiles/${tile}.webp`}
              alt={tile}
              className="w-full h-full object-fill"
            />
            {/* Front shading */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.1)] pointer-events-none rounded-[6px]" />
          </div>
          
          {/* Back */}
          <div
            className="absolute inset-0 rounded-[6px]"
            style={{
              transform: "rotateY(180deg) translateZ(33.33cqi)",
              background: "linear-gradient(135deg, var(--jade), #1a5235)",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
            }}
          />

          {/* Left */}
          <div
            className="absolute top-0 left-[50%] rounded-sm"
            style={{
              width: "66.66cqi",
              height: "100%",
              marginLeft: "-33.33cqi",
              transform: "rotateY(-90deg) translateZ(50cqi)",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(0,0,0,0.3)), linear-gradient(to right, var(--jade) 50%, #f0f0f0 50%)",
            }}
          />

          {/* Right */}
          <div
            className="absolute top-0 left-[50%] rounded-sm"
            style={{
              width: "66.66cqi",
              height: "100%",
              marginLeft: "-33.33cqi",
              transform: "rotateY(90deg) translateZ(50cqi)",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.4)), linear-gradient(to right, #f0f0f0 50%, var(--jade) 50%)",
            }}
          />

          {/* Top */}
          <div
            className="absolute left-0 top-[50%] rounded-sm"
            style={{
              width: "100%",
              height: "66.66cqi",
              marginTop: "-33.33cqi",
              transform: "rotateX(90deg) translateZ(66.66cqi)",
              background: "linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.1)), linear-gradient(to bottom, var(--jade) 50%, #ffffff 50%)",
            }}
          />

          {/* Bottom */}
          <div
            className="absolute left-0 top-[50%] rounded-sm"
            style={{
              width: "100%",
              height: "66.66cqi",
              marginTop: "-33.33cqi",
              transform: "rotateX(-90deg) translateZ(66.66cqi)",
              background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), linear-gradient(to bottom, #d0d0d0 50%, var(--jade) 50%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
