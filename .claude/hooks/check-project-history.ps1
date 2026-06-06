# Stop hook — Kural B zorlaması
# apps/ veya packages/ altında, docs/project-history.md'den DAHA YENİ bir dosya varsa
# (yani kod değişti ama history güncellenmedi) turu engeller.
# stop_hook_active=true ise (sonsuz döngü koruması) engellemez.

$ErrorActionPreference = 'SilentlyContinue'

# --- stdin JSON oku (stop_hook_active bayrağı) ---
$raw = [Console]::In.ReadToEnd()
if ($raw) {
    try {
        $j = $raw | ConvertFrom-Json
        if ($j.stop_hook_active -eq $true) { exit 0 }
    } catch { }
}

# --- proje kökü (.claude/hooks -> iki üst) ---
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$history = Join-Path $root 'docs\project-history.md'

# history yoksa zorlayacak bir şey yok
if (-not (Test-Path $history)) { exit 0 }
$historyTime = (Get-Item $history).LastWriteTimeUtc

# izlenecek kod klasörleri
$dirs = @('apps', 'packages') |
    ForEach-Object { Join-Path $root $_ } |
    Where-Object { Test-Path $_ }
if (-not $dirs) { exit 0 }   # henüz kod yok -> serbest geç

# hariç tutulanlar
$exclude = '[\\/](node_modules|\.git|\.next|dist|build|coverage)[\\/]'

$newest = Get-ChildItem -Path $dirs -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch $exclude } |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1

if (-not $newest) { exit 0 }

if ($newest.LastWriteTimeUtc -gt $historyTime) {
    $msg = "Kod degisikligi yapildi (apps/ veya packages/) ama docs/project-history.md guncellenmedi. " +
           "Lutfen docs/project-history.md SONUNA sablona uygun bir kayit EKLE (append-only): " +
           "tarih, agent, ne/neden, dokunulan dosyalar, ilgili dokuman/karar. Degisen dosya: " +
           $newest.FullName
    $out = @{ decision = 'block'; reason = $msg } | ConvertTo-Json -Compress
    Write-Output $out
    exit 0
}

exit 0
