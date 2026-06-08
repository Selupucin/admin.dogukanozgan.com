// @do/db — Vercel Blob depolama yardımcıları (yükleme + okuma + silme). — K25
// Kaynak: docs/04 "Dosya Depolama Notu (Vercel Blob)", docs/06 §5b + §6
// (token sadece sunucuda).
//
// TASARIM (docs/13 §Y1 güncel — GERÇEK PRIVATE DEPOLAMA):
// - Ruhsat/araç fotoğrafları + poliçe belgesi KİŞİSEL/ÖZEL NİTELİKLİ VERİDİR. Vercel Blob
//   (@vercel/blob ^2.4.0) artık `access:"private"` modunu destekler: blob URL'i imzasız
//   GET ile AÇILMAZ; içeriğe yalnız `BLOB_READ_WRITE_TOKEN` ile (SDK `get(..., {access:
//   "private", token})`) SUNUCUDAN erişilir.
// - BU NEDENLE: blob private'tır; ham URL ifşa olsa bile token olmadan okunamaz. Yine de
//   Asset.url SUNUCUDA tutulur ve erişim AUTH-GATED proxy ile verilir:
//     • Admin (her dosya): AUTH-GATED proxy → /dosya/<assetId> (admin) → `fetchBlobContent`
//       private blob'u token ile çeker ve STREAM eder.
//     • Müşteri (poliçe/teklif belgesi): belge artık MÜŞTERİYE E-POSTA EKİ olarak gönderilir
//       (apps/admin deliverToCustomerAction); ayrı imzalı indirme linki/rota YOKTUR.
// - Yükleme web/admin app'ten (server action), görüntüleme auth-gated admin proxy'sinden;
//   hepsi aynı Blob store'a `BLOB_READ_WRITE_TOKEN` ile bağlanır.
// - `@vercel/blob` paketi kullanılır (`put` / `get` / `del`). Env yoksa zarifçe devre dışı
//   kalır (feature flag).
//
// ⚠️ GÜVENLİK: BLOB_READ_WRITE_TOKEN + Asset.url YALNIZCA sunucuda kullanılır. Bu modül
// hiçbir zaman istemci bileşenine import EDİLMEMELİDİR ("server-only" sınırı).

import { put, del, get } from "@vercel/blob";

/**
 * Blob içindeki yol öneki (ruhsat/araç fotoğrafları). Blob'da "bucket" yoktur;
 * bu önek yalnızca pathname düzeni içindir.
 */
export const STORAGE_PREFIX = "quote-assets";

/** Vercel Blob yapılandırması mevcut mu? (feature flag) */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export interface UploadInput {
  /** Blob içindeki tam pathname (ör. "trafik/<quoteId>/<uuid>-ruhsat.jpg"). */
  path: string;
  /**
   * Dosya içeriği. ArrayBuffer / Uint8Array kabul edilir (Vercel Blob `put` bunları
   * çalışma zamanında destekler).
   */
  body: ArrayBuffer | Uint8Array;
  /**
   * İçerik tipi (MIME). ZORUNLU ve İMZA-DOĞRULANMIŞ olmalıdır (docs/13 §K2):
   * çağıran taraf önce `validateUpload` ile dosyayı doğrular ve dönen `mime` değerini
   * BURAYA verir. İstemcinin beyan ettiği `file.type` ASLA doğrudan geçirilmemelidir.
   * İmza doğrulaması burada DEĞİL çağıranlarda yapılır; storage yalnız temiz bir
   * contentType'ı zorunlu kılar.
   */
  contentType: string;
}

export interface UploadResult {
  /** Blob pathname (silme/okuma için saklanır → Asset.path). */
  path: string;
  /** Blob URL (PRIVATE; yalnız token ile sunucudan okunur → Asset.url). */
  url: string;
}

/**
 * Bir dosyayı Vercel Blob'a yükler. Token yoksa hata fırlatır
 * (çağıran taraf feature-flag ile bunu zarifçe yakalamalı).
 *
 * Not: `addRandomSuffix: false` — yükleme yolları çağıran tarafça zaten benzersiz
 * üretilir (`buildAssetPath`). `access: "private"` (@vercel/blob ^2.4.0): blob yalnız
 * `BLOB_READ_WRITE_TOKEN` ile sunucudan okunur (imzasız URL ile AÇILMAZ). İçerik admin
 * auth-gated proxy'den `fetchBlobContent` ile servis edilir; müşteriye belge e-posta eki
 * olarak gider (docs/13 §Y1, docs/06 §5b).
 */
export async function uploadToStorage(input: UploadInput): Promise<UploadResult> {
  if (!isStorageConfigured()) {
    throw new StorageNotConfiguredError();
  }

  // docs/13 §K2: contentType zorunlu ve temiz olmalı (imza-doğrulanmış MIME).
  // Çağıran `validateUpload` çalıştırmadan/contentType vermeden buraya gelmemeli.
  const contentType = (input.contentType || "").trim();
  if (!contentType) {
    throw new Error(
      "uploadToStorage: contentType zorunludur (imza-doğrulanmış MIME). " +
        "Önce validateUpload ile doğrulayın (docs/13 §K2).",
    );
  }

  const pathname = `${STORAGE_PREFIX}/${input.path}`;
  // Vercel Blob `put` Buffer/Blob/Stream kabul eder; ArrayBuffer/Uint8Array'i Buffer'a çevir.
  const bytes = input.body instanceof Uint8Array ? input.body : new Uint8Array(input.body);
  const result = await put(pathname, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: false,
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { path: result.pathname, url: result.url };
}

/**
 * Bir veya birden çok Blob nesnesini kalıcı olarak siler (KVKK imha). Private blob'larla
 * uyumludur: `del` `BLOB_READ_WRITE_TOKEN` ile yetkilenir.
 * `urlsOrPaths` Asset.url (tam Blob URL) veya pathname olabilir; `del` her ikisini
 * de kabul eder.
 */
export async function deleteFromStorage(urlsOrPaths: string[]): Promise<void> {
  const targets = urlsOrPaths.filter(Boolean);
  if (targets.length === 0) return;
  if (!isStorageConfigured()) {
    throw new StorageNotConfiguredError();
  }

  await del(targets, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

export interface BlobContent {
  /** Ham içerik (stream'e/Response'a verilebilir). */
  body: ArrayBuffer;
  /** Blob'un servis ettiği içerik tipi (yoksa application/octet-stream). */
  contentType: string;
}

/**
 * PRIVATE bir blob'un içeriğini SUNUCUDA çeker (docs/13 §Y1 auth-gated proxy için).
 *
 * `urlOrPath` Asset.url (private blob URL) veya pathname (Asset.path) olabilir. Blob
 * `access:"private"` olduğundan token OLMADAN okunamaz — bu yüzden `get(..., {access:
 * "private", token})` ile (SDK, Authorization header'ı otomatik ekler) çekilir ve dönüş
 * istemciye STREAM edilir; içerik yalnız auth-gated admin proxy'sinden servis edilir.
 *
 * İçerik bulunamaz/erişilemezse hata fırlatır (çağıran 404/502'ye çevirir).
 */
export async function fetchBlobContent(urlOrPath: string): Promise<BlobContent> {
  if (!isStorageConfigured()) {
    throw new StorageNotConfiguredError();
  }

  // Private okuma: token ile origin'den çek (useCache:false → her zaman taze, izinli içerik).
  const result = await get(urlOrPath, {
    access: "private",
    useCache: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || result.statusCode !== 200) {
    throw new Error("fetchBlobContent: private blob bulunamadı veya okunamadı.");
  }

  const contentType = result.blob.contentType || "application/octet-stream";
  const body = await new Response(result.stream).arrayBuffer();
  return { body, contentType };
}

/** Storage yapılandırılmamışken fırlatılır — feature-flag ile ayırt edilebilir. */
export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Vercel Blob is not configured (missing BLOB_READ_WRITE_TOKEN).");
    this.name = "StorageNotConfiguredError";
  }
}
