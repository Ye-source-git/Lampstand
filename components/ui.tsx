"use client";

import { C } from "@/lib/constants";

export function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 sm:px-4 py-2 text-sm font-medium transition-colors focus:outline-none whitespace-nowrap"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        color: active ? C.ink : C.inkSoft,
        borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

export function GoldButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity focus:outline-none"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        background: disabled ? C.goldSoft : C.gold,
        color: disabled ? C.inkSoft : C.white,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        background: "transparent",
        border: `1px solid ${C.border}`,
        color: C.ink,
      }}
    >
      {children}
    </button>
  );
}

export const selectStyle = {
  fontFamily: "'Albert Sans', sans-serif",
  background: C.white,
  border: `1px solid ${C.border}`,
  color: C.ink,
};
