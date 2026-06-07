"use client";

// Bildirim çanı (K29 / docs/12 §4) — okunmamış badge + açılır liste.
// Öğeye tıklayınca okundu işaretlenir ve ilgili kayda gidilir (relatedId/type'a göre).
// "Tümünü okundu işaretle" tüm okunmamışları kapatır.
//
// Veri server'dan (AppHeader) gelir; aksiyonlar server action'dır (oturum korumalı).
// Açılır panel basit dışına-tıkla ile kapanır (ek bağımlılık yok).

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import type { NotificationType } from "@do/db";
import { cn } from "@do/ui";
import { buttonClass } from "@/components/ui";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/actions";
import { notificationHref } from "@/lib/notifications-nav";

export interface BellNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  relatedId: string | null;
  read: boolean;
  createdAt: Date;
}

const TYPE_LABEL: Record<NotificationType, string> = {
  TEKLIF: "Teklif",
  ILETISIM: "İletişim",
  POLICE_BITIS: "Poliçe",
};

const TYPE_DOT: Record<NotificationType, string> = {
  TEKLIF: "bg-primary",
  ILETISIM: "bg-secondary",
  POLICE_BITIS: "bg-destructive",
};

function formatWhen(date: Date): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: BellNotification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Dışına tıklayınca kapat.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function openNotification(n: BellNotification) {
    const href = notificationHref(n.type, n.relatedId);
    startTransition(async () => {
      if (!n.read) await markNotificationReadAction(n.id);
      setOpen(false);
      if (href) router.push(href);
      else router.refresh();
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Bildirimler${unreadCount ? ` (${unreadCount} okunmamış)` : ""}`}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-muted"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-pill bg-destructive px-1 text-[10px] font-bold leading-[18px] text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[120] mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_18px_50px_-22px_hsl(210_56%_15%/0.45)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold">Bildirimler</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={pending}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Bildirim yok.</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-border last:border-0">
                    <button
                      type="button"
                      onClick={() => openNotification(n)}
                      disabled={pending}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-60",
                        !n.read && "bg-primary/5",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            n.read ? "bg-transparent" : TYPE_DOT[n.type],
                          )}
                          aria-hidden
                        />
                        <span className="rounded-pill bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                          {TYPE_LABEL[n.type]}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {formatWhen(n.createdAt)}
                        </span>
                      </span>
                      <span className="text-sm font-medium leading-snug">{n.title}</span>
                      {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Link
              href="/policeler"
              onClick={() => setOpen(false)}
              className={cn(buttonClass("ghost", "sm"), "w-full")}
            >
              Poliçe takvimini aç
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
