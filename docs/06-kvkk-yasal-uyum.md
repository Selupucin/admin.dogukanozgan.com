# 06 — KVKK & Yasal Uyum

> ⚠️ **Sorumluluk reddi:** Bu döküman teknik uygulama rehberidir, hukuki danışmanlık
> değildir. Metinler (aydınlatma, rıza, politika) ve saklama süreleri **bir hukukçu /
> KVKK danışmanı** tarafından onaylanmalıdır. Veri sorumlusu Doğukan Özgan'dır.

Site, ad-soyad, telefon, **TC Kimlik No** ve bazı formlarda **sağlık verisi** topladığı
için 6698 sayılı KVKK'ya tam uyum zorunludur.

## Toplanan Veri Türleri

| Veri                         | Nerede       | Kategori                              |
| ---------------------------- | ------------ | ------------------------------------- |
| Ad soyad, telefon, e-posta   | Tüm formlar  | Kişisel veri                          |
| TC Kimlik No                 | Trafik vb.   | Kişisel veri (hassas işlem)           |
| Plaka, araç bilgisi          | Trafik/Kasko | Kişisel veri                          |
| Doğum tarihi, cinsiyet       | Sağlık, BES  | Kişisel veri                          |
| **Kronik hastalık / sağlık** | Sağlık formu | **Özel nitelikli (sağlık verisi)** ⚠️ |
| IP, çerez, tarayıcı          | Otomatik     | Kişisel veri                          |

## Uyum Kontrol Listesi

### 1. Aydınlatma Yükümlülüğü

- [ ] **Aydınlatma Metni** sayfası (`/kvkk`) — veri sorumlusu, işleme amacı, hukuki
      sebep, aktarım, saklama süresi, veri sahibi hakları.
- [ ] Her formun yanında aydınlatma metnine **link**.

### 2. Açık Rıza

- [ ] Her formda **işaretlenmesi zorunlu** rıza onay kutusu (ön-işaretli OLMAYACAK).
- [ ] Onaysız form gönderimi **engellenir** (sunucu tarafında da kontrol).
- [ ] **Sağlık/hayat formunda ayrı, ikinci açık rıza** (özel nitelikli veri için).
- [ ] Rıza kanıtı saklanır: `consentAt`, `consentIp`, `consentUserAgent`
      (bkz. [04 Veri Modeli](./04-veri-modeli.md)).

#### 2a. Rıza-UX Kuralı: Modal + Scroll ile "Okudum" Kapısı (web-builder)

Açık rızanın **bilgilendirilmiş** olması için, kullanıcı metni gerçekten görmeden rıza
veremez. Web formunda (AutoForm) uygulanan desen:

- [ ] Rıza satırındaki **"KVKK Aydınlatma Metni"** linkine tıklanınca metin bir **MODAL
      (dialog)** içinde açılır. Modal içeriği `/kvkk` sayfası ile **TEK KAYNAKTAN** gelir
      (içerik kopyalanmaz; ortak bileşen/parça paylaşılır).
- [ ] Rıza onay kutusu, kullanıcı **modalı açıp metni en alta kadar SCROLL edene** kadar
      **disabled** (işaretlenemez). Scroll en alta ulaşınca modal içindeki **"Okudum ve
      onaylıyorum"** butonu aktifleşir; tıklanınca modal kapanır ve rıza işaretlenir.
- [ ] Kullanıcı metni okumadan kutuya tıklarsa **kutu işaretlenmez**, bunun yerine modal açılır.
- [ ] **Kısa metin** (içerik ekranı doldurmuyorsa) da "okundu" sayılır (kaydırma gerekmeden
      buton aktif) → erişilebilirlik/UX için.
- [ ] **Sağlık/Hayat (sensitive)** ikinci (açık nitelikli) rıza için **AYNI desen**, kendi
      metni/modalı ile (sağlık verisine özel açık rıza metni).
- [ ] Modal **erişilebilir**: `role="dialog"` + `aria-modal`, **focus tuzağı**, **ESC** ile
      kapatma, arka plan kaydırması kilitli, açılınca odak modale taşınır, kapanınca tetikleyene döner.

> Not: Bu, sunucu tarafı rıza kontrolünü (madde 2) **değiştirmez**; istemci UX'i rızanın
> bilinçli verilmesini güçlendirir. Sunucu yine `kvkkConsent`/`sensitiveConsent` true mu
> kontrol eder ve rıza kanıtını kaydeder.

### 3. Çerez (Cookie) Yönetimi

- [ ] İlk ziyarette **çerez onay banner'ı**.
- [ ] Zorunlu olmayan çerezler (analitik vb.) **onaydan önce çalışmaz**.
- [ ] **Çerez Politikası** sayfası.

### 4. Yasal Sayfalar

- [ ] Aydınlatma Metni
- [ ] Gizlilik Politikası
- [ ] Çerez Politikası
- [ ] _(Gerekirse)_ Veri Sahibi Başvuru Formu / iletişim kanalı (`KEP`/e-posta)

### 5. Özel Nitelikli Veri (Sağlık) — Ekstra

- [ ] Ayrı açık rıza (yukarıda).
- [ ] Şifreli saklama, erişim kısıtı (sadece admin).
- [ ] Mümkünse sağlık verisini en aza indir (örn. "kronik hastalık var/yok" yeterli,
      detay istenmesin).

### 5b. Yüklenen Dosyalar (Ruhsat/Araç Fotoğrafı) — Vercel Blob Notu (K25)

> ⚠️ **Artık risk (kabul edilen):** Dosyalar **Vercel Blob**'da saklanır. Blob URL'leri
> uzun, **tahmin-edilemez rastgele token** içerir; ancak **"public-stil"dir** — yani
> imzalı/süreli URL değildir, bağlantıyı bilen herkes erişebilir. Risk azaltımı:

- [ ] Bu URL'ler **yalnızca kimlik doğrulanmış admin ekranında** gösterilir (web sitesinde
      veya genel hiçbir yerde görünmez).
- [ ] Hiçbir yerde **indekslenmez** (admin domaini `noindex`; URL'ler sitemaps/sayfalarda
      yer almaz).
- [ ] URL'ler loglanmaz, üçüncü taraflara aktarılmaz.
- [ ] İşlem (teklif sonuçlandı / silme talebi / saklama süresi doldu) sonrası dosyalar
      Blob'dan **`del()` ile kalıcı silinir** (`Asset.path` ile).
- [ ] Sağlık verisini en aza indirme ilkesi gereği fotoğraf yalnızca **gerçekten gereken**
      ürünlerde (ör. Trafik ruhsat) istenir.

### 6. Veri Güvenliği

- [ ] HTTPS (Vercel varsayılan).
- [ ] Admin paneli auth + middleware koruması.
- [ ] Veritabanı erişim anahtarları (`DATABASE_URL`) ve `BLOB_READ_WRITE_TOKEN` sadece
      sunucuda (`.env`, asla istemciye sızmaz).
- [ ] Kişisel veri içeren admin sayfaları `noindex`.
- [ ] Rate limiting (form spam + giriş denemeleri).

### 7. Saklama & İmha

- [ ] Saklama süresi belirlenir (🔧 hukukçu ile — örn. talep tarihinden itibaren X ay).
- [ ] Süre dolunca otomatik/periyodik silme veya anonimleştirme.
- [ ] Veri sahibi silme talebinde panelden silme (bkz. [05](./05-admin-panel-crm.md)).

### 8. İşletme Yükümlülükleri (Site dışı — Doğukan'a hatırlatma)

- [ ] **VERBİS** kaydı (eşik/şartlar uygunsa).
- [ ] **Aydınlatma + rıza metinleri** hukukçu onayı.
- [ ] Veri sorumlusu iletişim bilgisi (KEP adresi vb.).

## Form Gönderim Akışında KVKK (Teknik)

```
Kullanıcı formu doldurur
   └─ Rıza kutusu işaretli mi? ──hayır──► Gönderim engellenir, uyarı
        │ evet
        ▼
   (Sağlık formuysa) 2. rıza işaretli mi? ──hayır──► engellenir
        │ evet
        ▼
   Server Action: rıza + IP + zaman + user-agent KAYDEDİLİR
        ▼
   QuoteRequest oluşturulur ► panele düşer
```

## 🔧 Bu Dökümanda Netleşecekler

- Saklama süresi (hukukçu ile).
- Aydınlatma/rıza metinlerinin nihai içeriği.
- Analitik araç kullanılacak mı (Google Analytics → çerez onayına bağlı)?
- VERBİS gerekliliği (Doğukan'ın işletme durumu).
