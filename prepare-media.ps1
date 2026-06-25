param(
  [string]$ManifestPath = ".\media-manifest.json"
)

$ErrorActionPreference = "Stop"
$outDir = ".\assets\media"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (!(Test-Path $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$urls = Get-Content $ManifestPath -Raw | ConvertFrom-Json

foreach ($url in $urls) {
  $fileName = [System.IO.Path]::GetFileName(([System.Uri]$url).AbsolutePath)
  $outPath = Join-Path $outDir $fileName
  if (!(Test-Path $outPath)) {
    Invoke-WebRequest -Uri $url -OutFile $outPath
  }
}

# Optional optimization if ImageMagick is installed.
$magick = Get-Command magick -ErrorAction SilentlyContinue
if ($magick) {
  Get-ChildItem $outDir -File -Include *.jpg,*.jpeg,*.png | ForEach-Object {
    $inPath = $_.FullName
    $webpPath = [System.IO.Path]::ChangeExtension($inPath, ".webp")
    & magick $inPath -strip -quality 82 -resize "2200x2200>" $webpPath
  }
}
