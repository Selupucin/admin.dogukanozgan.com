"use client";

// 4 haneli PIN giriş alanı — tek <input>, numeric. Erişilebilir, autoFocus seçilebilir.
// Sadece rakam kabul eder; en çok 4 hane. docs/05 (PIN kilit).

import { forwardRef } from "react";
import { cn } from "@do/ui";

interface PinInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  /** Enter'a basınca tetiklenir (form submit yerine). */
  onEnter?: () => void;
}

export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(function PinInput(
  { id, value, onChange, autoFocus, disabled, ariaLabel, onEnter },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      pattern="\d{4}"
      maxLength={4}
      autoFocus={autoFocus}
      disabled={disabled}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      className={cn(
        "w-full rounded-xl border border-input bg-background px-4 py-3 text-center font-heading text-2xl tracking-[0.75em]",
        "outline-none transition-colors placeholder:tracking-normal placeholder:text-base placeholder:text-muted-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:opacity-50",
      )}
      placeholder="••••"
    />
  );
});
