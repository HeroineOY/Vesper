[CmdletBinding()]
param(
    [ValidatePattern("^[A-Z]$")]
    [string]$DriveLetter = "R",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$drive = "${DriveLetter}:"
$mappedRoot = "${drive}\"
$desktopPackage = Get-Content (Join-Path $root "apps\desktop\package.json") -Raw | ConvertFrom-Json
$artifactPattern = "Vesper-$($desktopPackage.version)-win-*.exe"
$releaseDir = Join-Path $root "apps\desktop\release"
$createdMapping = $false
$buildStarted = Get-Date

if (Test-Path $mappedRoot) {
    throw "Drive $drive is already in use. Pass another free drive letter."
}

try {
    & subst.exe $drive $root
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $mappedRoot)) {
        throw "Could not map $drive to $root"
    }
    $createdMapping = $true

    Set-Location $mappedRoot
    $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
    $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"

    if (-not $SkipBuild) {
        & npm.cmd --prefix apps/desktop run build
        if ($LASTEXITCODE -ne 0) {
            throw "Desktop production build failed with exit code $LASTEXITCODE"
        }
    }

    & npm.cmd --prefix apps/desktop run builder -- --win portable
    if ($LASTEXITCODE -ne 0) {
        throw "Electron Builder failed with exit code $LASTEXITCODE"
    }

    $deadline = (Get-Date).AddMinutes(10)
    $artifact = $null
    while (-not $artifact -and (Get-Date) -lt $deadline) {
        $artifact = Get-ChildItem $releaseDir -Filter $artifactPattern -File -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -ge $buildStarted } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($artifact) {
            break
        }
        Start-Sleep -Seconds 2
    }
    if (-not $artifact) {
        throw "Portable executable was not produced in $releaseDir"
    }

    $unpackedDir = Join-Path $releaseDir "win-unpacked"
    if (Test-Path -LiteralPath $unpackedDir) {
        Remove-Item -LiteralPath $unpackedDir -Recurse -Force
    }

    Write-Host "Portable executable ready: $($artifact.FullName)"
}
finally {
    Set-Location $root
    if ($createdMapping) {
        & subst.exe $drive /D
    }
}
