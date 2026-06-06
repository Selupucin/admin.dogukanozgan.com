"use client";

// SSS akordeon (docs/09 madde 7). Erişilebilir açılır-kapanır liste.
// Klavye: <button> + aria-expanded; içerik region olarak ilişkilendirilir.

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@do/ui";
import { faqs, type FaqItem } from "@/lib/faq";
import type { Locale } from "@/i18n/routing";

export function FaqAccordion({
  locale,
  items = faqs,
}: {
  locale: Locale;
  /** Gösterilecek SSS listesi (varsayılan: genel SSS). Ürün sayfası kendi SSS'ini geçer. */
  items?: FaqItem[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
              >
                <span>{item.q[locale]}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-secondary transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6"
            >
              {item.a[locale]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
