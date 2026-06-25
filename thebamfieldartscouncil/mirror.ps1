$ErrorActionPreference = "Stop"

# Mirrors a PUBLIC website into a static folder for Cloudflare Pages.
# This will not work while the site is behind an Elementor "private" gate.

$SiteUrl = "https://thebamfieldartscouncil.org/"
$OutDir = Join-Path $PSScriptRoot "site"

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

Write-Host "Mirroring $SiteUrl"
Write-Host "Output -> $OutDir"

function Require-Command($name) {
  if (!(Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing dependency: '$name'. Install it and re-run."
  }
}

# Prefer HTTrack when available (best for Windows mirroring).
if (Get-Command "httrack" -ErrorAction SilentlyContinue) {
  # Common flags:
  # -O output dir
  # --mirror enables mirroring mode
  # --get/post, cookies, etc are intentionally not used (static mirroring only)
  # -%v verbose
  httrack $SiteUrl --mirror -O "$OutDir" -%v
  Write-Host "Done. Review files in $OutDir"
  exit 0
}

# Fallback to wget if available (works well for many sites).
if (Get-Command "wget" -ErrorAction SilentlyContinue) {
  # -E: adjust extensions to .html
  # -H: span hosts (avoid; keep off)
  # -k: convert links for local browsing
  # -K: keep original backups (.orig)
  # -p: download all page requisites
  # -r: recursive
  # -l 5: recursion depth
  # -np: no parent
  # --no-check-certificate: NOT recommended; do not use
  Push-Location $OutDir
  try {
    wget $SiteUrl -E -k -K -p -r -l 5 -np
  } finally {
    Pop-Location
  }
  Write-Host "Done. Review files in $OutDir"
  exit 0
}

throw @"
No mirroring tool found.

Install one of:
- HTTrack (recommended on Windows): https://www.httrack.com/
- GNU Wget: https://eternallybored.org/misc/wget/

Then re-run:
  .\thebamfieldartscouncil\mirror.ps1

"@

