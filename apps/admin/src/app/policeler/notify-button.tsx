"use client";

// "Yaklaşanları bildir" butonu — notifyExpiringPolicies çağırır (K32, opsiyonel).

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { notifyExpiringAction } from "./actions";

export function NotifyButton({ days = 30 }: { days?: number }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    setMsg(null);
    startTransition(async () => {
      const res = await notifyExpiringAction(days);
      if (!res.ok) setMsg(res.error ?? "İşlem başarısız.");
      else if (res.created === 0) setMsg("Yeni bildirim yok (tümü zaten bildirilmiş).");
      else setMsg(`${res.created} bildirim üretildi.`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={buttonClass("outline", "sm")}
      >
        {pending ? "Bildiriliyor…" : "Yaklaşanları bildir"}
      </button>
      {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}
