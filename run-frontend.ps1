$ErrorActionPreference = "Stop"

Set-ExecutionPolicy `
    -Scope Process `
    -ExecutionPolicy Bypass `
    -Force

$ProjectRoot = $PSScriptRoot

$machinePath =
    [Environment]::GetEnvironmentVariable(
        "Path",
        "Machine"
    )

$userPath =
    [Environment]::GetEnvironmentVariable(
        "Path",
        "User"
    )

$env:Path = "$machinePath;$userPath"

Set-Location $ProjectRoot

npm run dev