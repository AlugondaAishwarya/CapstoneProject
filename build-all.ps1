# PowerShell script to compile and package all microservices
Write-Host "Starting build for all Play Store Microservices..." -ForegroundColor Cyan

$services = @("eurekaserver", "userservice", "appservice", "reviewservice", "notificationservice", "api-gateway")

foreach ($service in $services) {
    Write-Host "`nBuilding $service..." -ForegroundColor Yellow
    Push-Location $service
    try {
        & mvn clean package -DskipTests
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build $service. Stopping build script."
            Pop-Location
            exit 1
        }
        Write-Host "Successfully packaged $service!" -ForegroundColor Green
    }
    catch {
        Write-Error "Exception during build of ${service}: $_"
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host "`nAll microservices built and packaged successfully! You can now run 'docker-compose up --build' or run each jar manually." -ForegroundColor Green
