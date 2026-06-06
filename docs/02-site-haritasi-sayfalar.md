# 02 — Site Haritası & Sayfalar

Tüm sayfalar hem TR hem EN olarak yayınlanır. Rota yapısı `/[locale]/...` şeklindedir
(örn. `/tr/planlar/trafik`, `/en/plans/traffic`).

> **Yerelleştirilmiş yollar (i18n routing):** TR kanonik yoldur; EN'de yol **parçaları
> da çevrilir** (next-intl `pathnames`). Dahili kanonik yol TR kalır (klasör yapısı
> `[locale]/planlar/...`), next-intl `Link`/`router` yerel yola otomatik çevirir.
> `hreflang` çiftleri her iki locale'in YEREL yoluna işaret eder.
>
> | Kanonik (TR)             | EN yolu                                                                                                        |
> | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
> | `/planlar`               | `/plans`                                                                                                       |
> | `/planlar/[slug]`        | `/plans/[slug]` — **tanım/reklam** sayfası (slug çevrilir → bkz. [03](./03-urunler-formlar-hesaplayicilar.md)) |
> | `/planlar/[slug]/teklif` | `/plans/[slug]/quote` — **teklif alma** (form) sayfası                                                         |
> | `/hakkimda`              | `/about`                                                                                                       |
> | `/iletisim`              | `/contact`                                                                                                     |
> | `/sss`                   | `/faq`                                                                                                         |
> | `/kvkk`                  | `/privacy-notice`                                                                                              |
> | `/gizlilik`              | `/privacy`                                                                                                     |
> | `/cerez-politikasi`      | `/cookie-policy`                                                                                               |
>
> 301 yönlendirmeleri yalnızca eski site → yeni **TR** rotalarını kapsar (TR kanonik).

## Genel (Public) Sayfalar

| Sayfa                  | Rota (TR)                   | İçerik                                                                                                                                                                      |
| ---------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Anasayfa**           | `/tr`                       | Hero, hizmet kartları, hesaplayıcı tanıtımı, güven unsurları, CTA                                                                                                           |
| **Hakkımda**           | `/tr/hakkimda`              | Doğukan'ın tanıtımı, deneyim, neden ben?                                                                                                                                    |
| **Planlar (liste)**    | `/tr/planlar`               | Zengin landing: giriş + neden acente + ürün kartları + nasıl çalışır + güven + SSS + CTA                                                                                    |
| **Ürün tanım/reklam**  | `/tr/planlar/[slug]`        | Sigortanın TANIMI + reklamı (ne işe yarar, kapsam/teminat, avantaj, neden Doğukan, kısa SSS) + (varsa) **hesaplayıcı**. Form YOK; belirgin "Teklif Al" CTA → teklif sayfası |
| **Ürün teklif (form)** | `/tr/planlar/[slug]/teklif` | Sadece ürüne özel teklif formu (AutoForm, KVKK modal'lı). Tanım sayfasına geri link. Hesaplayıcı YOK                                                                        |
| **İletişim**           | `/tr/iletisim`              | Telefon, WhatsApp, e-posta, adres, harita, genel form                                                                                                                       |
| **SSS**                | `/tr/sss`                   | Sıkça sorulan sorular (açılır-kapanır); ürün bazında da gösterilebilir                                                                                                      |
| **KVKK / Gizlilik**    | `/tr/kvkk`                  | Aydınlatma metni, gizlilik politikası, çerez politikası                                                                                                                     |

> **Blog:** Şimdilik yok (istenmedi). İleride eklenmek istenirse altyapı uygundur.
> **Müşteri yorumları / referanslar:** **Yok** (istenmedi). Güven, anlaşmalı şirket
> şeridi + deneyim/istatistik + şeffaf süreç ile kurulacak.

> Ürün tanım **ve** teklif sayfaları tek birer şablondan (`[slug]`, `[slug]/teklif`)
> üretilir; içerik ve form alanları `definitions.ts`'ten gelir (bkz.
> [01](./01-teknoloji-mimari.md), [03](./03-urunler-formlar-hesaplayicilar.md)).
>
> **Tanım ↔ teklif ayrımı (K: web dönüşüm akışı):** Tanım/reklam sayfası ürünü tanıtır
> ve hesaplayıcıyı barındırır; ziyaretçi hazır olduğunda "Teklif Al" CTA ile ayrı teklif
> sayfasına geçer (sade, tek odaklı form deneyimi → daha yüksek dönüşüm). Hesaplayıcıdaki
> "bu değerlerle teklif al" da teklif sayfasına gider (değerler query ile ön-doldurulabilir).
> 301 yönlendirmeleri ve dahili tanıtım linkleri (header/footer/branş kartı/anasayfa) TANIM
> sayfasına gider; yalnız form/CTA teklif sayfasına yönlendirir.

## Admin (Korumalı) Sayfalar

> ⚠️ Admin **ayrı domainde** (örn. `admin.dogukanozgan.com`) — ayrı uygulama, `noindex`.

| Sayfa              | Rota                      | İçerik                                        |
| ------------------ | ------------------------- | --------------------------------------------- |
| **Giriş**          | `admin.../login`          | E-posta + şifre ile admin girişi              |
| **Teklif listesi** | `admin.../teklifler`      | Tüm talepler; ürün/durum/tarih filtreli tablo |
| **Teklif detayı**  | `admin.../teklifler/[id]` | Tüm form alanları + CRM (durum, not)          |

> Admin paneli detayları → [05 Admin Panel & CRM](./05-admin-panel-crm.md)

## Anasayfa Bölümleri (Referans Tasarım Akışı)

Referans tasarımdaki akış benimsenir (detay → [09 Tasarım](./09-tasarim-ui-ux.md)):

1. **Üst bar** — güven mesajı + telefon + "Hasar anında" linki.
2. **Hero** — güçlü başlık + alt metin + çift CTA (Teklif Al / WhatsApp) + istatistik
   şeridi + **yanında hızlı teklif formu kartı**.
3. **Güven şeridi** — anlaşmalı sigorta şirketleri.
4. **Sigorta çeşitleri (branşlar)** — ürün kartları (her biri `/planlar/[slug]`'a gider).
5. **Nasıl çalışır** — 3 adım.
6. **Hesaplayıcı vurgusu** — "BES birikiminizi hesaplayın" gibi etkileşimli kanca.
7. **Sık sorulanlar (SSS)** — açılır-kapanır.
8. **Final CTA** — koyu zeminli güçlü kapanış çağrısı.
9. **Footer** — site haritası, iletişim, KVKK linkleri, harita, sosyal medya.

> Not: Müşteri yorumları bölümü **yok** (istenmedi).

## Global Bileşenler (Her Sayfada)

- **Header / Navbar** — logo, menü, dil değiştirici (TR/EN), tema (dark/light) düğmesi.
- **Sabit WhatsApp butonu** — sağ alt köşede, her sayfada.
- **Çerez onay banner'ı** — ilk ziyarette (KVKK).
- **Footer** — iletişim + yasal linkler.

## İletişim Bilgileri (Mevcut — doğrulanmalı)

Eski siteden alınan bilgiler — yeni sitede teyit edilecek:

- 📞 Telefon / WhatsApp: **+90 546 527 28 82**
- ✉️ E-posta: **dogukanozgan@akplansigorta.com.tr**
- 📍 Adres: Mecidiyeköy Mah. Büyükdere Cad. Kuğu İş Hanı No:81 D:4, Şişli/İstanbul

> 🔧 Sonra netleşecek: Bu bilgilerin güncel olup olmadığı, sosyal medya hesapları,
> ofis konum (harita) koordinatları.

## Çözülen Sorular ✅

- **Blog:** Yok (ileride olabilir).
- **SSS:** Var — hem ayrı sayfa hem anasayfada bölüm.
- **Müşteri yorumları/referanslar:** **Yok** (istenmedi).
- **Ürün listesi:** Tüm sigorta ürünleri — bkz. [03](./03-urunler-formlar-hesaplayicilar.md).

## 🔧 Sonra Netleşecek

- SSS soru/cevap içerikleri (TR + EN).
- Doğukan'ın gerçek iletişim/konum bilgileri (aşağıdaki teyit).
