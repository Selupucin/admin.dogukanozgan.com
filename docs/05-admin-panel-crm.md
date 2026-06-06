# 05 — Admin Panel & CRM

Doğukan'ın gelen teklif taleplerini görüp yönettiği korumalı yönetim arayüzü.
Ayrı bildirim yok (e-posta/WhatsApp); Doğukan panele girip takip eder.

> ⚠️ **Ayrı domain (K21):** Admin paneli, genel siteden **ayrı bir domainde** çalışır
> (örn. `admin.dogukanozgan.com`). Ayrı Next.js uygulamasıdır; genel site ile sadece
> ortak veritabanını/depolamayı paylaşır. Tüm admin domaini `noindex` + `robots: disallow`.
> Mimari → [01](./01-teknoloji-mimari.md).

## Kimlik Doğrulama (Auth.js)

- Sadece yetkili admin(ler) erişebilir.
- Admin uygulamasının **tüm rotaları** middleware ile korunur — oturum yoksa `/login`'e
  yönlenir (ayrı domain olduğu için tüm uygulama korumalı; karışık public/admin yok).
- Başlangıçta **tek admin** (Doğukan). Şema çok kullanıcıya hazır (`User.role`).
- Şifreler hash'lenir; oturum güvenli çerezde (`AUTH_SECRET`).

## Ekranlar

### 1) Giriş — `admin.dogukanozgan.com/login`

E-posta + şifre. Hatalı denemede genel hata mesajı (kullanıcı sızdırmaz).

### 2) Teklif Listesi — `/teklifler`

Tablo görünümü, en yeni üstte:

| Sütun    | Açıklama                                        |
| -------- | ----------------------------------------------- |
| Tarih    | `createdAt`                                     |
| Ürün     | Trafik / Sağlık / BES / Konut … (renk etiketli) |
| Ad Soyad | `fullName`                                      |
| Telefon  | tıklayınca ara (`tel:`) / WhatsApp linki        |
| Durum    | CRM rozeti (Yeni, Arandı…)                      |
| İşlem    | "Detay"                                         |

**Filtreler:** Ürüne göre · Duruma göre · Tarih aralığı · Arama (ad/telefon).
**Özet kartları (üstte):** Toplam talep · Yeni (okunmamış) · Bu hafta · Dönüşüm (Poliçe yapıldı).

### 3) Teklif Detayı — `/teklifler/[id]`

- **Tüm form alanları** — `definitions.ts`'teki etiketlerle okunabilir biçimde
  (payload JSON ham değil, "TC Kimlik No: 1234…" gibi).
- **Hızlı aksiyonlar:** WhatsApp'tan yaz · Telefonla ara · E-posta gönder.
- **CRM durumu:** açılır menüden değiştir (Yeni → Arandı → Teklif verildi → …).
- **Notlar:** zaman damgalı not ekleme listesi (`Note` modeli).
- **KVKK kanıtı:** rıza zamanı/IP (salt-okunur, kanıt amaçlı).
- **Sil / anonimleştir:** KVKK silme talebi için.

## CRM Durum Akışı

```
   YENI ──► ARANDI ──► TEKLIF_VERILDI ──► POLICE_YAPILDI  (✅ kazanım)
     │         │              │
     └─────────┴──────────────┴──────────►  IPTAL  (❌ kayıp)
```

- Her durum değişikliği `updatedAt`'i günceller.
- 🔧 İstenirse durum geçmişi (audit log) ayrı tabloyla tutulabilir — şimdilik son durum.

## Yetki & Güvenlik

- Tüm admin server action'larında oturum kontrolü.
- Rate limiting (giriş denemeleri).
- Kişisel veri içeren ekranlar arama motorlarına kapalı (`noindex`).
- HTTPS zorunlu (Vercel varsayılan).

## 🔧 Bu Dökümanda Netleşecekler

- Excel/CSV dışa aktarma istenecek mi?
- Durum geçmişi (audit log) gerekli mi?
- Birden fazla admin / rol gerekecek mi?
- Panelde basit istatistik/grafik (aylık talep, dönüşüm oranı) istenir mi?
