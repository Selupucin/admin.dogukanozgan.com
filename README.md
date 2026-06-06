# dogukanozgan.com — Monorepo

Doğukan Özgan (çoklu şirket sigorta acentesi) web platformu. Tüm geliştirme
`docs/` dökümantasyonuna ve [`CLAUDE.md`](./CLAUDE.md) kurallarına bağlıdır.

## Yapı

```
dogukanozgan/                  # pnpm workspaces + Turborepo monorepo
├─ apps/
│  ├─ web/                     # → dogukanozgan.com (genel site, port 3000)
│  └─ admin/                   # → admin.dogukanozgan.com (yönetim, noindex, port 3001)
├─ packages/
│  ├─ db/                      # Prisma şeması + client (ORTAK)
│  ├─ products/                # Ürün tanımları (A yaklaşımı) + calculators/
│  ├─ ui/                      # Tasarım token'ları + Tailwind preset + shadcn temel
│  └─ config/                  # Paylaşımlı ESLint + Prettier + tsconfig (K24)
└─ docs/                       # Proje dökümantasyonu (tek doğru kaynak)
```

Paket scope: `@do/*` (web, admin, db, products, ui, config).

## Geliştirme

```bash
pnpm install            # tüm workspace bağımlılıkları
pnpm db:generate        # Prisma client üret (DB bağlantısı gerekmez)
pnpm dev                # tüm app'leri çalıştır (turbo) — web:3000, admin:3001
pnpm build              # tüm workspace build
pnpm typecheck          # tsc --noEmit (tüm paketler) — pre-push hook bunu çalıştırır
pnpm lint               # ESLint (tüm app'ler)
pnpm format             # Prettier yaz
```

### Tek app çalıştırma

```bash
pnpm --filter @do/web dev
pnpm --filter @do/admin dev
```

## Git Hook'ları (K24)

Husky + lint-staged repoda versiyonlanır (`.husky/`):

- **pre-commit** → `pnpm lint-staged` (staged dosyalara ESLint `--fix` + Prettier).
- **pre-push** → `pnpm typecheck` (tip hatalı kod uzak depoya gitmez).

`pnpm install` sonrası `prepare` script'i Husky'yi otomatik kurar.

## Ortam Değişkenleri

Her app ve `packages/db` kendi `.env.example` dosyasını taşır. Gerçek `.env`
dosyaları **asla commit edilmez** (`.gitignore` kapsar). Değerler Supabase
projesinden ve Vercel proje ayarlarından gelir. Bkz. `docs/01`.

## Dağıtım (Vercel — İki Ayrı Proje)

Ayrı domain kararı (K21) gereği **iki ayrı Vercel projesi** aynı monorepo'dan
deploy edilir, **aynı Supabase'i** paylaşır.

| Vercel Projesi       | Root Directory | Domain                           | Notlar                    |
| -------------------- | -------------- | -------------------------------- | ------------------------- |
| `dogukanozgan-web`   | `apps/web`     | `dogukanozgan.com` (+ `www` 301) | Genel site, indexlenir    |
| `dogukanozgan-admin` | `apps/admin`   | `admin.dogukanozgan.com`         | noindex + robots disallow |

### Her iki proje için ortak ayarlar

1. **Framework Preset:** Next.js.
2. **Root Directory:** ilgili app klasörü (`apps/web` veya `apps/admin`).
   Vercel monorepo'yu otomatik algılar; `vercel.json` install/build komutlarını
   kök pnpm workspace'e yönlendirir.
3. **Install Command:** `cd ../.. && pnpm install` (vercel.json'da tanımlı).
4. **Build Command:** `cd ../.. && pnpm --filter @do/<app> build` (vercel.json'da).
5. **Environment Variables:** ilgili `.env.example` içindeki anahtarlar
   Vercel proje ayarlarına girilir (Production + Preview).
   - Web: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
   - Admin: yukarıdakiler + `AUTH_SECRET`, `ADMIN_EMAIL`.
6. **Domain Bağlama:** Vercel proje → Settings → Domains.
   - Web: `dogukanozgan.com` (apex) + `www.dogukanozgan.com` → apex'e 301.
   - Admin: `admin.dogukanozgan.com` (CNAME → `cname.vercel-dns.com`).

> Açık: Gerçek Supabase projesi ve domain DNS bağlama Aşama 6'da (yayın) yapılır.
> Aşama 0 yalnızca yapıyı hazırlar.

## Dökümantasyon

`docs/README.md` indekstir. Kritik: `01` (mimari), `04` (veri modeli),
`08` (yol haritası), `09` (tasarım).
