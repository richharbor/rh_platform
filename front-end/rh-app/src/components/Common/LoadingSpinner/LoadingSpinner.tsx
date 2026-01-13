import React from "react";

type LoadingSpinnerProps = {
  visible?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_MAP: Record<string, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

export default function LoadingSpinner({
  visible = true,
  message,
  size = "md",
}: LoadingSpinnerProps) {
  if (!visible) return null;

  return (
    <div
      aria-hidden={!visible}
      role="status"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-white/40 backdrop-blur-md"
    >
      {/* Container to center content */}
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Spinner */}
        <svg
          className={`animate-spin ${SIZE_MAP[size]} text-emerald-600`}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-20"
          />
          <path
            d="M45 25a20 20 0 00-6.6-15.5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* Optional message */}
        {message && (
          <div className="text-sm text-muted-foreground text-center">
            {message}
          </div>
        )}

        {/* Screen reader text */}
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
