"use client";

// Admin filtreleri için tema-uyumlu Select sarmalayıcı (K33 / docs/12 §4).
// Native <select> yerine @do/ui Select kullanır (erişilebilir, dark mode, özel açılır liste).
//
// Boş değer ("Tümü") Radix Select'te value="" KULLANILAMAZ → özel "__all" sentinel
// değeriyle temsil edilir; onChange'e boş string olarak iletilir.

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@do/ui";

const ALL = "__all";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Tümü",
  allLabel = "Tümü",
  ariaLabel,
}: {
  /** Seçili değer ("" = tümü). */
  value: string;
  /** Değişimde çağrılır ("" = tümü). */
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  allLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <Select value={value ? value : ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
      <SelectTrigger aria-label={ariaLabel} className="min-h-[40px] py-2 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
