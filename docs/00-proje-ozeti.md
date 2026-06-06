# 00 — Proje Özeti

## Amaç

Doğukan Özgan'ın sigorta danışmanlığı işini dijitalde temsil eden, ziyaretçileri
**teklif talebine (lead)** dönüştüren ve bu talepleri tek bir **admin panelden**
yönetmesini sağlayan modern bir web uygulaması geliştirmek.

Mevcut site eski bir jQuery/Bootstrap şablonu üzerine kuruludur ve sadece statik
tanıtım yapar. Yeni site **sıfırdan**, güncel teknolojiyle ve dinamik (veritabanı +
yönetim paneli) olarak inşa edilecektir.

## Hedefler

1. **Dönüşüm:** Ziyaretçinin "teklif al" yolculuğunu kolaylaştırmak (her ürüne özel form).
2. **Yönetim:** Gelen taleplerin kaybolmaması — hepsi panele düşsün, durum takibi yapılsın.
3. **Güven:** Profesyonel, hızlı, mobil uyumlu, KVKK'ya tam uyumlu bir site.
4. **Esneklik:** Yeni sigorta ürünleri ve form alanları kolayca eklenebilsin/değiştirilsin.
5. **⭐ Tasarım & marka:** Modern, ilgi çekici ve güven veren bir görünüm — rakiplerden
   ayrışan, yüksek UI/UX kalitesi (bkz. [09](./09-tasarim-ui-ux.md)).
6. **🔍 SEO:** Her detayda arama motoru görünürlüğü gözetilir (bkz. [07](./07-cokdilli-tema-seo.md)).

## Kapsam (Bu Projede VAR)

- Tanıtım sayfaları (anasayfa, hakkımda, iletişim)
- Her sigorta türü için ayrı ürün sayfası
- Ürüne özel teklif formları (her formun alanları farklı)
- Bazı ürünlerde hesaplayıcılar (BES birikim, Konut/DASK)
- Teklif taleplerini saklayan veritabanı
- Admin panel + mini CRM (durum takibi)
- Çok dilli (TR/EN) içerik
- Dark mode
- Sabit WhatsApp / hızlı iletişim
- Fotoğraf/dosya depolama (Supabase Storage) — **özellikle Trafik sigortasında
  müşteriden istenecek fotoğraflar için** (ruhsat, araç vb.)
- SSS (Sıkça Sorulan Sorular)
- ⭐ Modern, güven veren tasarım + yüksek UI/UX
- Her detayda SEO
- Tam KVKK uyumu

## Kapsam (Bu Projede YOK — şimdilik)

- Doğukan'ın panelden kod yazmadan yeni ürün+form **tipi** oluşturması (dinamik form
  oluşturucu). Bunun yerine **A yaklaşımı**: yeni ürünler geliştirici tarafından kodla
  eklenir (bkz. [03](./03-urunler-formlar-hesaplayicilar.md)).
- Online ödeme / poliçe satışı (acente süreci dışarıda, manuel).
- Yeni teklif geldiğinde e-posta/WhatsApp bildirimi (sadece panel üzerinden takip).
- **Blog** — şimdilik istenmiyor (ileride eklenebilir).

## Alınan Kararlar (Karar Günlüğü)

Aşağıdaki kararlar fikir alışverişi sonucunda netleşmiştir:

| #   | Konu                         | Karar                                                                                       | Gerekçe                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | Site tipi                    | Full-stack uygulama (statik değil)                                                          | Admin panel + veritabanı gerekli                                                                                                                                                                                                                                                                                                                                                   |
| K2  | Teknoloji                    | Next.js + React + TypeScript                                                                | Güncel, hızlı, SEO + API + admin tek çatı                                                                                                                                                                                                                                                                                                                                          |
| K3  | Ürün yapısı                  | Her ürün = ayrı sayfa + ürüne özel form (+ ops. hesaplayıcı)                                | İhtiyaç bu yönde                                                                                                                                                                                                                                                                                                                                                                   |
| K4  | Ürün yönetimi                | **A** — geliştirici kodla ekler                                                             | B (dinamik form oluşturucu) projeyi 3-4x büyütür                                                                                                                                                                                                                                                                                                                                   |
| K5  | Teklif akışı                 | Form → veritabanı → admin panel                                                             | Talepler kaybolmasın, tek yerden yönetilsin                                                                                                                                                                                                                                                                                                                                        |
| K6  | Bildirim                     | Sadece panel (ayrı e-posta/WhatsApp bildirimi yok)                                          | Doğukan panelden takip edecek                                                                                                                                                                                                                                                                                                                                                      |
| K7  | Admin panel                  | Giriş + teklif listesi + detay + **mini CRM**                                               | Durum takibi isteniyor                                                                                                                                                                                                                                                                                                                                                             |
| K8  | Diller                       | TR + EN                                                                                     | Yayın Türkiye, ama EN içerik de olacak                                                                                                                                                                                                                                                                                                                                             |
| K9  | Dark mode                    | Var                                                                                         | İstendi                                                                                                                                                                                                                                                                                                                                                                            |
| K10 | Barındırma                   | Vercel                                                                                      | Next.js'in native ev sahibi                                                                                                                                                                                                                                                                                                                                                        |
| K11 | Veritabanı/depolama          | ~~Supabase (PostgreSQL + Storage)~~ → **MongoDB Atlas + Vercel Blob** (K25 ile güncellendi) | Fotoğraf/dosya da saklanacak                                                                                                                                                                                                                                                                                                                                                       |
| K12 | KVKK                         | Tam uyum (Türkiye mevzuatı)                                                                 | Yasal zorunluluk                                                                                                                                                                                                                                                                                                                                                                   |
| K13 | Tasarım                      | ⭐ Modern/ilgi çekici/güven veren; referans tasarım baz                                     | Tasarım kalitesi öncelikli; lacivert+teal+turuncu palet                                                                                                                                                                                                                                                                                                                            |
| K14 | SEO                          | Her detayda gözetilir                                                                       | Organik trafik kritik                                                                                                                                                                                                                                                                                                                                                              |
| K15 | Fotoğraf depolama amacı      | Trafik sigortasında müşteriden istenen fotoğraflar                                          | (ruhsat/araç vb.)                                                                                                                                                                                                                                                                                                                                                                  |
| K16 | Ürün kapsamı                 | Tüm sigorta ürünleri olacak                                                                 | Doğukan hepsini yapabiliyor                                                                                                                                                                                                                                                                                                                                                        |
| K17 | Blog                         | Yok                                                                                         | İstenmedi (ileride olabilir)                                                                                                                                                                                                                                                                                                                                                       |
| K18 | SSS                          | Var                                                                                         | İstendi                                                                                                                                                                                                                                                                                                                                                                            |
| K19 | Müşteri yorumları/referans   | **Yok**                                                                                     | İstenmedi; güven başka unsurlarla kurulur                                                                                                                                                                                                                                                                                                                                          |
| K20 | Hesaplayıcılar               | Sağlık ✅ · BES ✅ · Hayat ✅ (mevcut bilgiye göre)                                         | Trafik ❌; diğerleri sonra netleşir                                                                                                                                                                                                                                                                                                                                                |
| K21 | Domain ayrımı                | **Web ve admin AYRI domainlerde**                                                           | Web: dogukanozgan.com · Admin: **admin.dogukanozgan.com**; güvenlik + ayrışma                                                                                                                                                                                                                                                                                                      |
| K22 | Logo / marka                 | Logo yok; metin wordmark **"Doğukan Özgan"**                                                | Görsel logo mevcut değil                                                                                                                                                                                                                                                                                                                                                           |
| K23 | Konumlandırma                | **Çoklu şirket acentesi** (birçok firmanın acenteliği)                                      | "En uygun teklifi bul" modeli; referans tasarım anlatısı geçerli                                                                                                                                                                                                                                                                                                                   |
| K24 | Kod kalitesi                 | Husky + lint-staged (commit anında)                                                         | Detay docs/01                                                                                                                                                                                                                                                                                                                                                                      |
| K25 | Veritabanı/depolama (revize) | **MongoDB Atlas (Prisma `mongodb` provider) + Vercel Blob** — Supabase tamamen bırakıldı    | **Kullanıcı kararı** (onaylı sapma). MongoDB belge modeli `payload` JSON yaklaşımıyla doğal uyumlu; Vercel Blob, Vercel deploy ile tek platformda foto saklama. Şema değişiklikleri `prisma db push` ile (MongoDB'de SQL migration yok). Veri modeli/alan semantiği (QuoteRequest/Note/User/Asset, payload, rıza alanları) **korunur**; yalnız ID'ler ObjectId, depolama Blob URL. |

## 🔧 Sonra Netleşecek Konular

Bu noktalar "sonra düzelteceğim" olarak işaretlendi; esnek tasarlanacak:

- **Her ürünün tam form alanları** — taslak [03](./03-urunler-formlar-hesaplayicilar.md)'te;
  ince ayar sonra.
- **Hesaplayıcı kapsamı** — mevcut bilgiye göre Sağlık, BES, Hayat'ta var; diğer ürünlerde
  (Konut/DASK vb.) olup olmayacağı netleşecek.
- **Hesaplama formülleri** — her hesaplayıcının güncel mevzuata uygun katsayı/oranları.
- **Marka kimliği / logo** — mevcut logo yok; tasarımla birlikte oluşturulacak.

## Çözülen Açık Sorular ✅

- ✅ **Fotoğraf depolama ne için?** → **Trafik sigortasında müşteriden istenecek
  fotoğraflar** (örn. ruhsat, araç görselleri). [04](./04-veri-modeli.md)'e işlendi.
- ✅ **Blog?** → Hayır (ileride olabilir). **SSS?** → Evet. **Müşteri yorumları/referans?**
  → **Hayır** (istenmedi).
- ✅ **Hangi ürünler?** → **Tüm sigorta ürünleri** olacak (Doğukan hepsini yapabiliyor).
- ✅ **Hesaplayıcılar?** → Sağlık, BES, Hayat'ta var (mevcut bilgiye göre); Trafik'te yok.
- ✅ **KVKK saklama/metinler?** → **Türkiye mevzuatında gereken neyse** ona göre.
- ✅ **Logo?** → **Logo yok.** Sadece isim: **"Doğukan Özgan"** (metin tabanlı wordmark).
- ✅ **Konumlandırma?** → **Tek şirket değil; birçok firmanın acenteliğini yapıyor**
  (çoklu şirket / "en uygun teklifi bul" modeli). Referans tasarımdaki çok-şirketli
  anlatı **geçerli ve kullanılacak**.
- ✅ **Admin domain?** → **`admin.dogukanozgan.com`** (onaylandı).

## Açık Sorular — Kodlamadan SONRA Verilecek

Kullanıcı bu ikisini **kodlama yapıldıktan sonra** sağlayacak; bu yüzden esnek/yer
tutucu tasarlanır (gerçek değerler tek yerden, `definitions.ts` + `calculators/`):

- ⏳ **Hesaplama formülleri** — BES devlet katkısı, sağlık & hayat prim mantığı.
  Hesaplayıcı iskeleti yer tutucu formülle kurulur; Doğukan gerçek formülü sonra verir.
- ⏳ **Her ürünün nihai form alanları** — taslak alanlarla başlanır; Doğukan kesin
  alan listesini sonra verir (alan ekle/çıkar tek satır).

## Açık Sorular (Hâlâ Cevap Bekleyen)

- ❓ **KVKK saklama süresi** ve yasal metinlerin nihai içeriği (hukukçu onayı).
