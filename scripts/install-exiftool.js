#!/usr/bin/env node

/**
 * ExifTool Installation Script for Vercel Deployment
 * 
 * This script automatically installs ExifTool binary for PDF metadata processing
 * on Vercel serverless functions. It handles different platforms and environments.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  const platform = process.platform;

  console.log('🔧 ExifTool Installation Script');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Platform: ${platform}`);
  console.log(`Vercel: ${isVercel ? 'Yes' : 'No'}`);

  // Skip installation in local development
  if (!isProduction && !isVercel) {
    console.log('⏭️  Skipping ExifTool installation in development environment');
    console.log('   Local development should use system-installed ExifTool');
    process.exit(0);
  }

  // For Vercel deployment
  if (isVercel || platform === 'linux') {
    console.log('🚀 Installing ExifTool for Vercel/Linux environment...');
    
    try {
      // Method 1: Try system package manager first
      try {
        console.log('📦 Attempting to install via apt-get...');
        execSync('apt-get update && apt-get install -y exiftool', { 
          stdio: 'inherit',
          timeout: 120000 // 2 minute timeout
        });
        console.log('✅ ExifTool installed successfully via apt-get');
        process.exit(0);
      } catch (aptError) {
        console.log('⚠️  apt-get installation failed, trying alternative method...');
      }

      // Method 2: Download standalone binary
      console.log('📥 Downloading ExifTool standalone binary...');
      
      const exiftoolDir = path.join(process.cwd(), 'bin');
      const exiftoolPath = path.join(exiftoolDir, 'exiftool');
      
      // Create bin directory
      if (!fs.existsSync(exiftoolDir)) {
        fs.mkdirSync(exiftoolDir, { recursive: true });
      }
      
      // Download ExifTool
      await downloadExifTool(exiftoolPath);
      
      // Make executable
      fs.chmodSync(exiftoolPath, '755');
      
      // Test installation
      execSync(`${exiftoolPath} -ver`, { stdio: 'inherit' });
      
      console.log('✅ ExifTool binary installed successfully');
      console.log(`📍 Location: ${exiftoolPath}`);
      console.log('💡 Set EXIFTOOL_PATH environment variable to:', exiftoolPath);
      
    } catch (error) {
      console.error('❌ ExifTool installation failed:', error.message);
      console.log('⚠️  Application will continue without ExifTool support');
      console.log('   RMS metadata extraction will be disabled');
    }
  } else {
    console.log(`⏭️  Skipping ExifTool installation for platform: ${platform}`);
    console.log('   Please install ExifTool manually for your platform');
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});

/**
 * Download ExifTool binary for Linux
 */
function downloadExifTool(targetPath) {
  return new Promise((resolve, reject) => {
    const url = 'https://exiftool.org/Image-ExifTool-13.33.tar.gz';
    const tempDir = path.join(process.cwd(), 'temp');
    const tarPath = path.join(tempDir, 'exiftool.tar.gz');
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log(`📡 Downloading from: ${url}`);
    
    const file = fs.createWriteStream(tarPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        
        try {
          // Extract tar.gz
          console.log('📂 Extracting ExifTool...');
          execSync(`cd ${tempDir} && tar -xzf exiftool.tar.gz`, { stdio: 'inherit' });
          
          // Find extracted directory (should be Image-ExifTool-13.33)
          const extractedDir = fs.readdirSync(tempDir).find(dir => 
            dir.startsWith('Image-ExifTool') && fs.statSync(path.join(tempDir, dir)).isDirectory()
          );
          
          if (!extractedDir) {
            throw new Error('Could not find extracted ExifTool directory');
          }
          
          // Copy exiftool script
          const sourcePath = path.join(tempDir, extractedDir, 'exiftool');
          fs.copyFileSync(sourcePath, targetPath);
          
          // Cleanup
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          resolve();
        } catch (extractError) {
          reject(extractError);
        }
      });
      
      file.on('error', (err) => {
        fs.unlink(tarPath, () => { /* ignore cleanup errors */ }); // Delete the file async
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}