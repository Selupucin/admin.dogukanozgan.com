"use client";

// İletişim talebi silme aksiyonu (KVKK — onay diyaloglu).

import { useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { deleteContactAction } from "../actions";

export function DeleteContactAction({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    const ok = window.confirm(
      "Bu iletişim talebi KALICI olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?",
    );
    if (!ok) return;
    startTransition(async () => {
      // Başarılıysa server action /iletisim-talepleri'ne yönlendirir.
      await deleteContactAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className={buttonClass("destructive", "sm")}
    >
      Kalıcı Sil
    </button>
  );
}
