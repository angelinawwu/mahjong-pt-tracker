"use client";

interface PlayerChipProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "jade" | "lacquer";
}

export function PlayerChip({
  label,
  selected,
  disabled,
  onClick,
  variant = "jade",
}: PlayerChipProps) {
  const activeClasses =
    variant === "lacquer"
      ? "bg-lacquer text-ivory border-lacquer shadow-[0_2px_10px_rgba(168,41,31,0.35)]"
      : "bg-jade text-ivory border-jade shadow-[0_2px_10px_rgba(15,61,51,0.3)]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`hover-transition rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${
        disabled
          ? "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/30"
          : selected
          ? activeClasses
          : "border-ink/15 bg-white/60 text-ink hover:border-ink/30"
      } ${!disabled && "active:scale-95"}`}
    >
      {label}
    </button>
  );
}
