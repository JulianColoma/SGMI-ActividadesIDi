"use client";

type HintProps = {
  show?: boolean;
  message: string;
  type?: "info" | "error";
};

export default function Hint({ show = false, message, type = "info" }: HintProps) {
  if (!show) return null;

  const color = type === "error" ? "text-black" : "text-zinc-400";
  const icon = type === "error" ? "⚠️" : "ℹ️";

  return (
    <p className={`mt-1 text-xs ${color} flex items-center gap-1`}>
      <span>{icon}</span>
      {message}
    </p>
  );
}