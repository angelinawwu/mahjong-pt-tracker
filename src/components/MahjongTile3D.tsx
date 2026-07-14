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
          {/* Front */}
          <div
            className="absolute inset-0 rounded-[2px]"
            style={{ transform: "translateZ(33.33cqi)" }}
          >
            <img
              src={`/tiles/${tile}.webp`}
              alt={tile}
              className="w-full h-full rounded-[2px] object-fill"
            />
          </div>
          
          {/* Back */}
          <div
            className="absolute inset-0 rounded-[2px]"
            style={{
              transform: "rotateY(180deg) translateZ(33.33cqi)",
              backgroundColor: "var(--jade)",
            }}
          />

          {/* Left */}
          <div
            className="absolute top-0 left-[50%]"
            style={{
              width: "66.66cqi",
              height: "100%",
              marginLeft: "-33.33cqi",
              transform: "rotateY(-90deg) translateZ(50cqi)",
              background: "linear-gradient(to right, var(--jade) 50%, white 50%)",
            }}
          />

          {/* Right */}
          <div
            className="absolute top-0 left-[50%]"
            style={{
              width: "66.66cqi",
              height: "100%",
              marginLeft: "-33.33cqi",
              transform: "rotateY(90deg) translateZ(50cqi)",
              background: "linear-gradient(to right, white 50%, var(--jade) 50%)",
            }}
          />

          {/* Top */}
          <div
            className="absolute left-0 top-[50%]"
            style={{
              width: "100%",
              height: "66.66cqi",
              marginTop: "-33.33cqi",
              transform: "rotateX(90deg) translateZ(66.66cqi)",
              background: "linear-gradient(to bottom, var(--jade) 50%, white 50%)",
            }}
          />

          {/* Bottom */}
          <div
            className="absolute left-0 top-[50%]"
            style={{
              width: "100%",
              height: "66.66cqi",
              marginTop: "-33.33cqi",
              transform: "rotateX(-90deg) translateZ(66.66cqi)",
              background: "linear-gradient(to bottom, white 50%, var(--jade) 50%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
