# PowerShell script to test ExifTool RMS configuration

Write-Host "Testing ExifTool RMS Configuration" -ForegroundColor Cyan

# Test 1: Check ExifTool version
Write-Host "`nTest 1: ExifTool Version" -ForegroundColor Yellow
& exiftool -ver

# Test 2: Check if config file loads correctly
Write-Host "`nTest 2: Loading RMS Config" -ForegroundColor Yellow
& exiftool -config config/exiftool/rms-config.pl -listx -XMP-rms:all | Select-String "rms"

# Test 3: Try different tag formats (if test-resume.pdf exists)
if (Test-Path "test-resume.pdf") {
    Write-Host "`nTest 3: Writing RMS metadata to test-resume.pdf" -ForegroundColor Yellow
    
    # Try format 1: With rms_ prefix
    Write-Host "Trying format: -XMP-rms:rms_contact_fullName" -ForegroundColor Gray
    & exiftool -config config/exiftool/rms-config.pl -XMP-rms:rms_contact_fullName="John Doe" test-resume.pdf
    
    # Try format 2: Without rms_ prefix  
    Write-Host "`nTrying format: -XMP-rms:contact_fullName" -ForegroundColor Gray
    & exiftool -config config/exiftool/rms-config.pl -XMP-rms:contact_fullName="John Doe" test-resume.pdf
    
    # Try format 3: Direct tag name
    Write-Host "`nTrying format: -rms_contact_fullName" -ForegroundColor Gray
    & exiftool -config config/exiftool/rms-config.pl -rms_contact_fullName="John Doe" test-resume.pdf
    
    # Test 4: Read back any RMS metadata
    Write-Host "`nTest 4: Reading RMS metadata from test-resume.pdf" -ForegroundColor Yellow
    & exiftool -config config/exiftool/rms-config.pl -XMP-rms:all test-resume.pdf
}
else {
    Write-Host "`nWarning: test-resume.pdf not found. Create a test PDF first." -ForegroundColor Red
}

# Test 5: Show all available RMS tags
Write-Host "`nTest 5: Available RMS Tags (first 20)" -ForegroundColor Yellow
& exiftool -config config/exiftool/rms-config.pl -listw -XMP-rms:all | Select-Object -First 20