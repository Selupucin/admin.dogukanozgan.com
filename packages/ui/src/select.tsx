"use client";

// @do/ui — Tema-uyumlu, erişilebilir özel Select (K33 / docs/12, docs/09).
//
// Native <select> yerine Radix Select (@radix-ui/react-select) tabanlı; açılır
// listesi de tamamen özelleştirilmiştir (docs/09 stili: yuvarlak, teal focus,
// dark mode uyumlu, ≥44px dokunma hedefi, mobil). Tam klavye + ekran okuyucu
// erişilebilirliği Radix tarafından sağlanır.
//
// packages/ui'de PAYLAŞILIR: web (auto-form + hero hızlı teklif) ve admin (filtreler)
// aynı bileşeni kullanır. Kontrollü (value/onValueChange) çalışır; RHF Controller ile
// kolayca bağlanır.

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "./lib/utils";

// ── Kök / değer / grup (Radix re-export) ──────────────────────────────────────
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

// ── Trigger (tıklanan kutu) — docs/09: yuvarlak, teal focus halkası, ≥44px ─────
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border-[1.5px] border-input bg-card px-4 py-2.5 text-base text-foreground shadow-sm transition",
        "hover:border-secondary/60",
        "focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Placeholder soluk; bir değer seçilince tam renk (Radix data-placeholder).
        "data-[placeholder]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform"
          aria-hidden
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

// ── İçerik (açılır liste) — özelleştirilmiş panel ──────────────────────────────
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "popper", ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          "relative z-[120] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_18px_50px_-22px_hsl(210_56%_15%/0.45)]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground">
          <ChevronUp className="h-4 w-4" aria-hidden />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground">
          <ChevronDown className="h-4 w-4" aria-hidden />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

// ── Tek seçenek — teal vurgu (seçili/odak), ≥40px dokunma hedefi ───────────────
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-base text-foreground outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[state=checked]:font-semibold data-[state=checked]:text-secondary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-secondary" strokeWidth={3} aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
});

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        "px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
