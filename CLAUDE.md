# CLAUDE.md — dogukanozgan.com Proje Kuralları

Bu, Doğukan Özgan (çoklu şirket sigorta acentesi) için yeni web platformudur.
Tüm geliştirme, `docs/` klasöründeki dökümantasyona göre yapılır.

---

## 🚨 DEĞİŞMEZ KURALLAR (her oturumda, her agent, her görevde)

### Kural 1 — Dökümantasyona Sıkı Bağlılık 📚

- **`docs/` tek doğru kaynaktır** (00–09 + README). Çalışmaya başlamadan **ilgili
  dökümanı oku**.
- Mimari, teknoloji, isimlendirme, sayfa/akış, veri modeli, KVKK ve tasarım
  kararlarında dökümandan **SAPMA**.
- Dökümanda **olmayan** veya **çelişen** bir durumla karşılaşırsan: **UYDURMA.** Dur,
  kullanıcıya sor; onaylanırsa **önce dökümanı güncelle**, sonra kodla.
- `🔧 sonra netleşecek` / `⏳ kodlamadan sonra` işaretli yerler için **yer tutucu
  (placeholder)** kullan ve gerçek değer gelince kolay değişecek şekilde esnek bırak
  (örn. formüller `packages/products/calculators/`, form alanları `definitions.ts`).

### Kural 2 — project-history'e Yaz 📝

- **Her geliştirme veya değişiklikten sonra** `docs/project-history.md` dosyasının
  **sonuna** bir kayıt **ekle** (append-only — eski kayıtları silme/değiştirme).
- Kayıt formatı dosyanın başındaki şablona uygun olmalı: tarih, agent, ne/neden,
  dokunulan dosyalar, ilgili döküman/karar (örn. `K21`, `Aşama 2`).

---

## Temel Kararlar (özet — detay docs/00'da)

- **Yığın:** Monorepo · Next.js (App Router) · TypeScript · Tailwind · shadcn/ui ·
  Prisma · Supabase (PostgreSQL + Storage) · Vercel.
- **İki ayrı domain:** Web `dogukanozgan.com` (`apps/web`) · Admin
  `admin.dogukanozgan.com` (`apps/admin`). Ortak `packages/` (db, products, ui).
- **Diller:** TR + EN. **Dark mode** var.
- **Ürünler:** Tüm sigorta türleri; her ürün = ayrı sayfa + ürüne özel form. Kodla
  yönetilir ("A yaklaşımı", `packages/products/definitions.ts`).
- **Hesaplayıcılar:** Sağlık, BES, Hayat (formüller sonra; yer tutucu).
- **Teklif akışı:** Form → Supabase → admin panel + mini CRM. Trafikte fotoğraf yükleme.
- **KVKK:** Tam uyum; sağlık/hayat verisi özel nitelikli (ek rıza).
- **Tasarım:** Modern, ilgi çekici, güven veren. Logo yok → "Doğukan Özgan" wordmark.
- **SEO:** Her detayda.

## Dökümana Hızlı Erişim

`docs/README.md` indeks; en kritikleri: `01` (mimari), `03` (ürün/form/hesaplayıcı),
`04` (veri modeli), `06` (KVKK), `08` (yol haritası), `09` (tasarım).

## Çalışma Tarzı

- Adım adım ilerle; büyük değişikliklerde önce planı doğrula.
- Yer tutucu kullandığın her yeri kod içinde `// TODO(doc): ...` ile ve
  project-history'de açıkça belirt.
