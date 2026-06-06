// Wordmark "Doğukan Özgan" — görsel logo yok (docs/09 "Logo / Marka").
// Fraunces ile dizilir; "Özgan" turuncu vurgulu. Yanında güven sembolü (kalkan+onay).

import { cn } from "@do/ui";
import { brandName } from "@/lib/site";

export function ShieldMark({ className }: { className?: string }) {
  // Güven sembolü: kalkan + onay işareti (docs/09 opsiyonel ikon).
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9 flex-none", className)} fill="none" aria-hidden>
      <path
        d="M20 3 5 9v9c0 9 6.4 15.6 15 19 8.6-3.4 15-10 15-19V9L20 3Z"
        className="fill-secondary"
      />
      <path
        d="M20 3 5 9v9c0 9 6.4 15.6 15 19 8.6-3.4 15-10 15-19V9L20 3Z"
        className="stroke-primary"
        strokeWidth="1.5"
      />
      <path
        d="m13 20 5 5 9-10"
        className="stroke-primary"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  withMark = true,
}: {
  className?: string;
  withMark?: boolean;
}) {
  const [first, last] = brandName.split(" ");
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {withMark && <ShieldMark />}
      <span className="font-heading text-xl font-semibold tracking-tight">
        {first} <span className="text-primary">{last}</span>
      </span>
    </span>
  );
}
