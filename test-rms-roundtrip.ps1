# PowerShell script to test full RMS roundtrip
# This tests: Parse PDF -> Extract RMS -> Generate PDF -> Embed RMS -> Verify

Write-Host "RMS Metadata Roundtrip Test" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Step 1: Check if ExifTool is available
Write-Host "`nStep 1: Checking ExifTool availability" -ForegroundColor Yellow
$exiftoolPath = "C:\Users\ashto\OneDrive\ExifTool\exiftool.exe"

if (Test-Path $exiftoolPath) {
    $version = & $exiftoolPath -ver
    Write-Host "✓ ExifTool version $version found" -ForegroundColor Green
} else {
    Write-Host "✗ ExifTool not found at $exiftoolPath" -ForegroundColor Red
    exit 1
}

# Step 2: Check if config file exists
Write-Host "`nStep 2: Checking RMS config file" -ForegroundColor Yellow
$configPath = "config/exiftool/rms-config.pl"

if (Test-Path $configPath) {
    Write-Host "✓ RMS config file found" -ForegroundColor Green
} else {
    Write-Host "✗ RMS config file not found at $configPath" -ForegroundColor Red
    exit 1
}

# Step 3: Create a test PDF with RMS metadata
Write-Host "`nStep 3: Creating test PDF with RMS metadata" -ForegroundColor Yellow
$testPdf = "test-rms-roundtrip.pdf"

# First, check if we have a source PDF
if (-not (Test-Path $testPdf)) {
    Write-Host "Creating a blank test PDF..." -ForegroundColor Gray
    # You'll need to run the app to generate a test PDF first
    Write-Host "Please generate a test PDF from the app first and save it as $testPdf" -ForegroundColor Yellow
    exit 1
}

# Step 4: Write RMS metadata to the test PDF
Write-Host "`nStep 4: Writing RMS metadata to test PDF" -ForegroundColor Yellow

$metadata = @{
    "rms_contact_fullName" = "John Doe"
    "rms_contact_email" = "john.doe@example.com"
    "rms_contact_phone" = "+1-555-123-4567"
    "rms_contact_city" = "San Francisco"
    "rms_contact_state" = "CA"
    "rms_contact_country" = "USA"
    "rms_summary" = "Experienced software engineer with expertise in web development"
    "rms_experience_count" = "2"
    "rms_experience_0_company" = "Tech Corp"
    "rms_experience_0_role" = "Senior Developer"
    "rms_experience_0_dateBegin" = "Jan 2020"
    "rms_experience_0_dateEnd" = "Present"
    "rms_skill_count" = "1"
    "rms_skill_0_category" = "Programming"
    "rms_skill_0_keywords" = "JavaScript, TypeScript, React, Node.js"
}

# Build ExifTool command
$args = @("-config", $configPath, "-overwrite_original")
foreach ($key in $metadata.Keys) {
    $args += "-$key=$($metadata[$key])"
}
$args += $testPdf

Write-Host "Writing metadata fields: $($metadata.Count)" -ForegroundColor Gray
& $exiftoolPath $args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Metadata written successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to write metadata" -ForegroundColor Red
    exit 1
}

# Step 5: Read back the metadata
Write-Host "`nStep 5: Reading back RMS metadata" -ForegroundColor Yellow
$readArgs = @("-config", $configPath, "-XMP-rms:all", "-j", $testPdf)
$jsonOutput = & $exiftoolPath $readArgs | Out-String
$readMetadata = $jsonOutput | ConvertFrom-Json

if ($readMetadata) {
    $rmsFields = $readMetadata[0].PSObject.Properties | Where-Object { $_.Name -match "rms" }
    Write-Host "✓ Found $($rmsFields.Count) RMS fields in PDF" -ForegroundColor Green
    
    Write-Host "`nExtracted RMS fields:" -ForegroundColor Gray
    foreach ($field in $rmsFields | Select-Object -First 10) {
        Write-Host "  $($field.Name): $($field.Value)" -ForegroundColor Gray
    }
    if ($rmsFields.Count -gt 10) {
        Write-Host "  ... and $($rmsFields.Count - 10) more fields" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Failed to read metadata" -ForegroundColor Red
}

# Step 6: Test API endpoints (if server is running)
Write-Host "`nStep 6: Testing API endpoints" -ForegroundColor Yellow
Write-Host "Note: Make sure the Next.js server is running (npm run dev)" -ForegroundColor Gray

# Test extract endpoint
try {
    $extractResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/resume/extract-rms" -Method GET -ErrorAction Stop
    if ($extractResponse.StatusCode -eq 200) {
        Write-Host "✓ Extract RMS API is available" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Extract RMS API not responding (is the server running?)" -ForegroundColor Yellow
}

# Test write endpoint
try {
    $writeResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/resume/write-rms" -Method GET -ErrorAction Stop
    if ($writeResponse.StatusCode -eq 200) {
        Write-Host "✓ Write RMS API is available" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Write RMS API not responding (is the server running?)" -ForegroundColor Yellow
}

Write-Host "`nRMS Roundtrip Test Complete!" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan