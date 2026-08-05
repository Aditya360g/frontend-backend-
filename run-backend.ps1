$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot "backend"

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

$env:JAVA_HOME =
    [Environment]::GetEnvironmentVariable(
        "JAVA_HOME",
        "User"
    )

$variableNames = @(
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_URL",
    "JWT_SECRET",
    "CORS_ALLOWED_ORIGINS",
    "REFRESH_TOKEN_COOKIE_SECURE",
    "PASSWORD_RESET_URL"
)

foreach ($variableName in $variableNames) {
    $variableValue =
        [Environment]::GetEnvironmentVariable(
            $variableName,
            "User"
        )

    if ($variableValue) {
        Set-Item `
            -Path "Env:$variableName" `
            -Value $variableValue
    }
}

Set-Location $BackendPath

.\mvnw.cmd spring-boot:run