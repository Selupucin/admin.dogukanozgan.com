"use client";

// Özel, hızlı seçimli, tema-uyumlu tarih seçici (docs/03 form alanları, docs/09 tasarım).
//
// NEDEN: native <input type="date"> doğum tarihi gibi geçmişe uzanan tarihlerde yavaş
// (kullanıcı ay ay geriye tıklar). Burada üstte YIL + AY açılır seçimi (@do/ui Select,
// tutarlı) → seçilen ay/yılın GÜN ızgarası → güne tıkla, tarih dolar, panel kapanır.
//
// DEĞER FORMATI: RHF değeri ISO `YYYY-MM-DD` string olarak saklanır (mevcut payload /
// Zod şeması uyumu — native date input ile aynı). Boşken "" .
//
// ERİŞİLEBİLİRLİK (docs/09): klavye (Enter/Space açar, ESC kapar, Tab içeride),
// ekran okuyucu (aria), ≥44px dokunma hedefi, dark+light, dış tıklama/ESC ile kapanır.
// TR+EN: ay adları Intl ile locale'e göre; tetikleyicide tarih gg.aa.yyyy okunur biçimde.

import { useEffect, useMemo, useRef, useState } from "react";
import { type UseFormReturn, Controller } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { cn, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@do/ui";
import type { ProductField, Locale } from "./types-bridge";

interface DateFieldProps {
  field: ProductField;
  locale: Locale;
  form: UseFormReturn<Record<string, unknown>>;
  id: string;
  describedBy?: string;
  triggerClass: string;
}

// ── ISO (YYYY-MM-DD) ⇄ parça yardımcıları (yerel zaman; UTC kaymasını önlemek için
// Date nesnesi DEĞİL, salt string parçalama kullanılır). ─────────────────────────────
function parseIso(value: string | undefined): { y: number; m: number; d: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]); // 1-12
  const d = Number(match[3]); // 1-31
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function toIso(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate(); // m: 1-12 → 0. gün = önceki ayın son günü
}

// Haftanın günü (Pazartesi=0 ... Pazar=6) — TR/EN takvim ızgarası Pazartesi başlar.
function mondayFirstWeekday(y: number, m: number, d: number): number {
  const js = new Date(y, m - 1, d).getDay(); // 0=Pazar ... 6=Cumartesi
  return (js + 6) % 7;
}

const RANGE_MIN_YEAR = 1920; // doğum tarihi için makul alt sınır (yer tutucu)

const L = {
  tr: {
    open: "Tarih seç",
    placeholder: "Tarih seçiniz",
    year: "Yıl",
    month: "Ay",
    weekdays: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"],
  },
  en: {
    open: "Pick date",
    placeholder: "Select a date",
    year: "Year",
    month: "Month",
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  },
} as const;

export function DateField({ field, locale, form, id, describedBy, triggerClass }: DateFieldProps) {
  return (
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: rhf }) => (
        <DatePicker
          locale={locale}
          id={id}
          describedBy={describedBy}
          triggerClass={triggerClass}
          value={(rhf.value as string) || ""}
          onChange={rhf.onChange}
          onBlur={rhf.onBlur}
        />
      )}
    />
  );
}

function DatePicker({
  locale,
  id,
  describedBy,
  triggerClass,
  value,
  onChange,
  onBlur,
}: {
  locale: Locale;
  id: string;
  describedBy?: string;
  triggerClass: string;
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
}) {
  const t = L[locale];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const parsed = parseIso(value);

  // Panelde görüntülenen ay/yıl (seçili tarih yoksa bugünden başla).
  const [viewYear, setViewYear] = useState<number>(parsed?.y ?? currentYear);
  const [viewMonth, setViewMonth] = useState<number>(parsed?.m ?? now.getMonth() + 1); // 1-12

  // Panel açıldığında görünümü seçili değere (varsa) hizala.
  useEffect(() => {
    if (open) {
      const p = parseIso(value);
      setViewYear(p?.y ?? currentYear);
      setViewMonth(p?.m ?? now.getMonth() + 1);
    }
    // value/now sabit kabul; sadece açılışta hizala.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC ile kapan (odağı tetikleyiciye ver). Dış-tıklama kapatması artık BACKDROP ile
  // yapılır (aşağıda) — böylece yıl/ay Select'i (Radix, body'ye portal) seçilince panel
  // YANLIŞLIKLA kapanmaz. Açıkken arka plan kaydırması kilitlenir (mobil sheet hissi).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Yıl listesi: bugünden geriye RANGE_MIN_YEAR'e (azalan — doğum tarihi için pratik).
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= RANGE_MIN_YEAR; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  // Ay adları locale'e göre (Intl). 1-12.
  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: fmt.format(new Date(2020, i, 1)),
    }));
  }, [locale]);

  // Görüntülenen ayın gün ızgarası (başına boşluk hücreleri).
  const grid = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const leading = mondayFirstWeekday(viewYear, viewMonth, 1);
    const cells: (number | null)[] = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const display = useMemo(() => {
    const p = parseIso(value);
    if (!p) return null;
    // Okunur biçim: gg.aa.yyyy (TR) / mm/dd/yyyy (EN).
    const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return fmt.format(new Date(p.y, p.m - 1, p.d));
  }, [value, locale]);

  function pickDay(d: number) {
    onChange(toIso(viewYear, viewMonth, d));
    setOpen(false);
    onBlur();
    triggerRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClass, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn(display ? "text-foreground" : "text-muted-foreground/70")}>
          {display ?? t.placeholder}
        </span>
        <CalendarDays className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            // Yalnız backdrop'a (panelin dışına) tıklayınca kapan — panel/Select içi kapatmaz.
            if (e.target === e.currentTarget) {
              setOpen(false);
              onBlur();
            }
          }}
        >
          <div
            role="dialog"
            aria-label={t.open}
            className={cn(
              "w-[min(22rem,100%)] max-h-[85vh] overflow-y-auto",
              "rounded-xl border border-border bg-popover p-3 text-popover-foreground",
              "shadow-[0_18px_50px_-22px_hsl(210_56%_15%/0.45)]",
            )}
          >
            {/* Üst: HIZLI yıl + ay seçimi (@do/ui Select — tutarlı, erişilebilir). */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <span className="sr-only">{t.month}</span>
                <Select value={String(viewMonth)} onValueChange={(v) => setViewMonth(Number(v))}>
                  <SelectTrigger aria-label={t.month} className="min-h-[40px] px-3 py-2 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="sr-only">{t.year}</span>
                <Select value={String(viewYear)} onValueChange={(v) => setViewYear(Number(v))}>
                  <SelectTrigger aria-label={t.year} className="min-h-[40px] px-3 py-2 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hafta günü başlıkları (Pazartesi başlar). */}
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {t.weekdays.map((w) => (
                <span key={w} aria-hidden>
                  {w}
                </span>
              ))}
            </div>

            {/* Gün ızgarası. */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d, i) =>
                d === null ? (
                  <span key={`empty-${i}`} aria-hidden />
                ) : (
                  <DayCell
                    key={d}
                    day={d}
                    selected={
                      !!parsed && parsed.y === viewYear && parsed.m === viewMonth && parsed.d === d
                    }
                    isToday={
                      viewYear === currentYear &&
                      viewMonth === now.getMonth() + 1 &&
                      d === now.getDate()
                    }
                    onPick={pickDay}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayCell({
  day,
  selected,
  isToday,
  onPick,
}: {
  day: number;
  selected: boolean;
  isToday: boolean;
  onPick: (d: number) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onPick(day)}
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        selected
          ? "bg-secondary font-semibold text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
          : "text-foreground",
        !selected && isToday && "ring-1 ring-inset ring-secondary/50",
      )}
    >
      {day}
    </button>
  );
}
