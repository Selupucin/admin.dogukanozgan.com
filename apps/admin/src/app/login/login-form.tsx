"use client";

// Giriş formu (client) — useActionState ile loginAction'a bağlanır.
// Tasarım: docs/09 token'ları (yuvarlak girdi, teal focus ring).

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { buttonClass } from "@/components/ui";

const inputClass =
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-foreground " +
  "placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 " +
  "focus:ring-ring focus:ring-offset-1 focus:ring-offset-background transition-shadow";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
      {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex w-full flex-col gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputClass}
          placeholder="ornek@dogukanozgan.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
