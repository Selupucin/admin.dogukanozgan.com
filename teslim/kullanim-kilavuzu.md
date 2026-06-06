# Doğukan Özgan — Admin Panel Kullanım Kılavuzu

Merhaba Doğukan! Bu kısa kılavuz, web sitenize gelen **teklif taleplerini** yönetmek
için kullanacağınız **admin paneli** anlatır. Teknik bilgi gerektirmez.

> Panel adresi: **https://admin.dogukanozgan.com**
> (Genel siteniz `dogukanozgan.com`'dan ayrıdır; panel sadece size özeldir, Google'da
> görünmez.)

---

## 1. Panele Giriş

1. Tarayıcıdan **admin.dogukanozgan.com** adresine gidin.
2. **E-posta** ve **şifrenizi** girin (size ilk kurulumda iletilir).
3. "Giriş" deyin. Şifrenizi unutursanız, sıfırlama için kurulumu yapan kişiye haber verin.

> Güvenlik: Şifrenizi kimseyle paylaşmayın. Ortak bilgisayarda "çıkış yap" demeyi unutmayın.

---

## 2. Teklifleri Görme ve Filtreleme

Giriş yapınca **Teklif Listesi** açılır. En yeni talep en üsttedir.

Her satırda: **tarih · ürün · ad soyad · telefon · durum** görürsünüz.

Üstteki **özet kartları** size hızlı bakış verir: toplam talep, yeni (okunmamış),
bu hafta, poliçeye dönüşen.

**Filtreler** ile listeyi daraltabilirsiniz:

- **Ürüne göre** (örn. sadece Trafik talepleri)
- **Duruma göre** (örn. sadece "Yeni" olanlar)
- **Tarih aralığı**
- **Arama** (ad veya telefon yazarak)

---

## 3. Bir Teklifin Detayını Açma

Bir satırdaki **"Detay"** butonuna tıklayın. Detay sayfasında:

- Müşterinin **doldurduğu tüm form bilgileri** anlaşılır biçimde (örn. "TC Kimlik No: …",
  "Plaka: …") görünür.
- Trafik gibi formlarda müşterinin **yüklediği fotoğraflar** (ruhsat/araç) güvenli
  şekilde gösterilir.

---

## 4. Müşteriyle İletişim (WhatsApp / Ara)

Detay sayfasındaki **hızlı aksiyon** butonları:

- **WhatsApp'tan yaz** — müşterinin numarasıyla WhatsApp sohbeti açılır.
- **Telefonla ara** — numarayı arar (telefonda) / arama uygulamasını açar.
- **E-posta gönder** — varsa e-posta adresine yazar.

Listeden de telefon numarasına tıklayarak arayabilirsiniz.

---

## 5. Durumu Değiştirme (Takip)

Her teklifin bir **durumu** vardır. Müşteriyle ilerledikçe güncelleyin:

```
Yeni  →  Arandı  →  Teklif verildi  →  Poliçe yapıldı  (kazanım)
                                  ↘   İptal             (kayıp)
```

Detay sayfasında durumu **açılır menüden** seçmeniz yeterli. Böylece hangi talebin
hangi aşamada olduğunu hiç kaybetmezsiniz.

---

## 6. Not Ekleme

Detay sayfasında **not** ekleyebilirsiniz (örn. "Fiyat verildi, Pazartesi tekrar
aranacak"). Notlar tarih damgalı listelenir; geçmiş görüşmeleri hatırlamanızı sağlar.

---

## 7. KVKK — Silme / Anonimleştirme

Bir müşteri **"verilerimi silin"** talep ederse (KVKK hakkı):

- Detay sayfasındaki **Sil / Anonimleştir** seçeneğini kullanın.
- Bu işlem kişisel veriyi (ad, telefon, TC, fotoğraflar) kalıcı olarak kaldırır.
- ⚠️ İşlem geri alınamaz; emin olun.

> Saklama süresi (ne kadar süre sonra verilerin otomatik silineceği) **hukukçu ile**
> belirlenecektir. O kural netleşince panele/sürece eklenir.

---

## 8. Yeni Ürün / Şirket Listesi Güncelleme Nasıl Talep Edilir?

Aşağıdakiler **kodla** yönetilir (panelden değil); değişiklik için geliştiriciye
**yazılı liste** iletmeniz yeterli:

- **Yeni sigorta ürünü** eklemek veya bir ürünün **form alanlarını** değiştirmek
  (örn. "Kasko formuna şasi no ekleyelim").
- **Anlaşmalı şirket listesini** güncellemek (hangi şirketlerle çalışıyorsunuz +
  logoları).
- **Hesaplayıcı formülleri** (Sağlık/BES/Hayat) için güncel oran/katsayılar.
- Fotoğrafınız/ofis görseli, sosyal medya hesapları, harita konumu.

Bunları net bir liste halinde iletin; geliştirici tek noktadan günceller ve yayına alır.

---

## Kısa Özet

| İhtiyaç                | Nerede                         |
| ---------------------- | ------------------------------ |
| Talepleri gör          | Teklif Listesi (giriş sonrası) |
| Filtrele / ara         | Liste üstündeki filtreler      |
| Detay + fotoğraf       | "Detay" butonu                 |
| Ara / WhatsApp         | Detay sayfası aksiyonları      |
| Takip durumu           | Detayda açılır menü            |
| Not                    | Detay sayfası                  |
| KVKK silme             | Detayda "Sil / Anonimleştir"   |
| Ürün/şirket güncelleme | Geliştiriciye yazılı liste     |

Herhangi bir sorunda kurulumu yapan kişiye ulaşın. Kolay gelsin!
