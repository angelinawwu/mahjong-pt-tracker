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
      ? "border-lacquer bg-lacquer/10 text-lacquer"
      : "border-jade bg-jade/10 text-jade";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`hover-transition flex h-[38px] items-center justify-center border px-[17px] text-sm font-medium whitespace-nowrap ${
        disabled
          ? "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/30"
          : selected
          ? activeClasses
          : "border-ink/15 bg-white text-jade hover:border-ink/30"
      } ${!disabled && "active:scale-95"}`}
    >
      {label}
    </button>
  );
}
