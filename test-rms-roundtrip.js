// test-rms-roundtrip.js
// Comprehensive test script for RMS metadata roundtrip functionality

const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// Configuration - detect platform and adjust paths
const path = require('path');
const os = require('os');

let EXIFTOOL_PATH;
let EXIFTOOL_CONFIG_PATH;

if (os.platform() === 'win32') {
  EXIFTOOL_PATH = 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
  EXIFTOOL_CONFIG_PATH = '.\\config\\exiftool\\rms-config.pl';
} else {
  // WSL/Linux environment
  EXIFTOOL_PATH = '/mnt/c/Users/ashto/OneDrive/ExifTool/exiftool.exe';
  EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';
}

// Sample RMS metadata for testing
const sampleRMSData = {
  // Essential fields
  'producer': 'rms_v2.0.1',
  'rms_schema_detail': 'https://github.com/rezi-io/resume-standard',
  'rms_version': 'v2.0.1',
  
  // Contact information
  'rms_contact_fullName': 'John Doe',
  'rms_contact_givenNames': 'John',
  'rms_contact_lastName': 'Doe',
  'rms_contact_email': 'john.doe@email.com',
  'rms_contact_phone': '(555) 123-4567',
  'rms_contact_city': 'San Francisco',
  'rms_contact_state': 'CA',
  'rms_contact_country': 'United States',
  'rms_contact_linkedin': 'https://linkedin.com/in/johndoe',
  'rms_contact_website': 'https://johndoe.dev',
  
  // Summary
  'rms_summary': 'Experienced software engineer with 5+ years of experience in full-stack development.',
  
  // Experience (2 entries)
  'rms_experience_count': '2',
  'rms_experience_0_company': 'Tech Corp',
  'rms_experience_0_role': 'Senior Software Engineer',
  'rms_experience_0_location': 'San Francisco, CA',
  'rms_experience_0_dateBegin': 'Jan 2020',
  'rms_experience_0_dateEnd': 'Present',
  'rms_experience_0_isCurrent': 'true',
  'rms_experience_0_description': '• Led development of scalable web applications\\n• Implemented microservices architecture\\n• Mentored junior developers',
  
  'rms_experience_1_company': 'StartupXYZ',
  'rms_experience_1_role': 'Software Engineer',
  'rms_experience_1_location': 'San Jose, CA',
  'rms_experience_1_dateBegin': 'Jun 2018',
  'rms_experience_1_dateEnd': 'Dec 2019',
  'rms_experience_1_isCurrent': 'false',
  'rms_experience_1_description': '• Built responsive web applications\\n• Developed RESTful APIs',
  
  // Education (1 entry)
  'rms_education_count': '1',
  'rms_education_0_institution': 'University of California, Berkeley',
  'rms_education_0_qualification': 'Bachelor of Science in Computer Science',
  'rms_education_0_location': 'Berkeley, CA',
  'rms_education_0_date': 'May 2018',
  'rms_education_0_isGraduate': 'true',
  'rms_education_0_score': '3.8',
  'rms_education_0_scoreType': 'GPA',
  
  // Skills (2 categories)
  'rms_skill_count': '2',
  'rms_skill_0_category': 'Programming Languages',
  'rms_skill_0_keywords': 'JavaScript, Python, TypeScript, Java',
  'rms_skill_1_category': 'Frameworks & Libraries',
  'rms_skill_1_keywords': 'React, Node.js, Express, Next.js',
  
  // Projects (1 entry)
  'rms_project_count': '1',
  'rms_project_0_title': 'Resume Builder Pro',
  'rms_project_0_organization': 'Personal Project',
  'rms_project_0_description': 'A modern resume builder with AI-powered optimization and ATS compatibility features.',
  'rms_project_0_url': 'https://github.com/johndoe/resume-builder',
  
  // Involvement (1 entry)
  'rms_involvement_count': '1',
  'rms_involvement_0_organization': 'Code for Good',
  'rms_involvement_0_role': 'Volunteer Developer',
  'rms_involvement_0_location': 'San Francisco, CA',
  'rms_involvement_0_dateBegin': 'Jan 2019',
  'rms_involvement_0_dateEnd': 'Present',
  'rms_involvement_0_description': 'Develop applications for non-profit organizations',
  
  // Certifications (1 entry)
  'rms_certification_count': '1',
  'rms_certification_0_name': 'AWS Certified Developer',
  'rms_certification_0_department': 'Amazon Web Services',
  'rms_certification_0_date': 'Mar 2021',
  'rms_certification_0_description': 'Professional certification for AWS development'
};

// Test functions
async function createTestPDF() {
  console.log('Creating test PDF using jsPDF...');
  
  try {
    const { jsPDF } = require('jspdf');
    
    // Create a valid PDF using jsPDF
    const doc = new jsPDF();
    
    // Add some test content
    doc.setFontSize(20);
    doc.text('Test Resume Document', 20, 30);
    
    doc.setFontSize(12);
    doc.text('John Doe', 20, 50);
    doc.text('Software Engineer', 20, 60);
    doc.text('john.doe@email.com', 20, 70);
    doc.text('(555) 123-4567', 20, 80);
    
    doc.text('Experience:', 20, 100);
    doc.text('• Senior Software Engineer at Tech Corp (2020-Present)', 25, 110);
    doc.text('• Software Engineer at StartupXYZ (2018-2019)', 25, 120);
    
    doc.text('Education:', 20, 140);
    doc.text('• BS Computer Science, UC Berkeley (2018)', 25, 150);
    
    doc.text('Skills:', 20, 170);
    doc.text('• JavaScript, Python, TypeScript, React, Node.js', 25, 180);
    
    // Save the PDF
    const pdfBuffer = doc.output('arraybuffer');
    fs.writeFileSync('test-resume-for-rms.pdf', Buffer.from(pdfBuffer));
    
    console.log('✓ Valid test PDF created using jsPDF');
  } catch (error) {
    console.error('❌ Failed to create PDF with jsPDF:', error.message);
    throw new Error('Could not create test PDF');
  }
}

async function embedRMSMetadata() {
  console.log('\\nEmbedding RMS metadata into PDF...');
  
  // Build ExifTool arguments
  const args = [
    '-config', EXIFTOOL_CONFIG_PATH,
    '-overwrite_original'
  ];
  
  // Add each metadata field as an argument with proper XMP namespace
  Object.entries(sampleRMSData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Producer goes to PDF metadata, not XMP
      if (key === 'producer') {
        args.push(`-PDF:Producer=${String(value)}`);
      } else {
        // RMS fields go to XMP-rms namespace
        args.push(`-XMP-rms:${key}=${String(value)}`);
      }
    }
  });
  
  args.push('test-resume-for-rms.pdf');
  
  try {
    const { stdout, stderr } = await execFileAsync(EXIFTOOL_PATH, args, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
      windowsHide: true,
    });
    
    if (stderr) {
      console.warn('ExifTool warnings:', stderr);
    }
    
    console.log('✓ RMS metadata embedded successfully');
    console.log(`Fields written: ${Object.keys(sampleRMSData).length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to embed RMS metadata:', error.message);
    return false;
  }
}

async function extractRMSMetadata() {
  console.log('\\nExtracting RMS metadata from PDF...');
  
  try {
    const { stdout, stderr } = await execFileAsync(
      EXIFTOOL_PATH,
      [
        '-config', EXIFTOOL_CONFIG_PATH,
        '-j', // JSON output
        '-XMP-rms:all', // Extract all RMS metadata
        '-PDF:Producer',
        '-PDF:Creator',
        '-b', // Binary output for large fields
        'test-resume-for-rms.pdf'
      ],
      {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
        windowsHide: true,
      }
    );
    
    if (stderr) {
      console.warn('ExifTool warnings:', stderr);
    }
    
    // Parse JSON output
    const metadataArray = JSON.parse(stdout);
    const extractedMetadata = metadataArray[0] || {};
    
    console.log('✓ RMS metadata extracted successfully');
    console.log(`Fields extracted: ${Object.keys(extractedMetadata).length}`);
    
    return extractedMetadata;
  } catch (error) {
    console.error('❌ Failed to extract RMS metadata:', error.message);
    return null;
  }
}

function validateRoundtrip(originalData, extractedData) {
  console.log('\\nValidating roundtrip data integrity...');
  
  const results = {
    totalOriginal: Object.keys(originalData).length,
    totalExtracted: Object.keys(extractedData).length,
    matched: 0,
    missing: [],
    different: [],
    extra: []
  };
  
  // Check original fields in extracted data
  Object.entries(originalData).forEach(([key, originalValue]) => {
    // Look for the field in extracted data (ExifTool may format keys differently)
    let extractedValue = extractedData[key];
    
    // Try alternative key formats (ExifTool capitalizes the first letter)
    if (extractedValue === undefined) {
      // Try with capital first letter
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      extractedValue = extractedData[capitalizedKey];
    }
    
    // Try with XMP namespace prefix
    if (extractedValue === undefined) {
      extractedValue = extractedData[`XMP-rms:${key}`] || extractedData[`RMS${key.replace('rms_', '')}`];
    }
    
    if (extractedValue === undefined) {
      results.missing.push(key);
    } else if (String(extractedValue) !== String(originalValue)) {
      results.different.push({
        field: key,
        original: originalValue,
        extracted: extractedValue
      });
    } else {
      results.matched++;
    }
  });
  
  // Check for extra fields in extracted data
  Object.keys(extractedData).forEach(key => {
    // Skip SourceFile and other non-RMS fields
    if (key === 'SourceFile') return;
    
    // Convert key back to lowercase for comparison
    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
    
    if (!originalData[key] && !originalData[lowerKey] && (key.startsWith('rms_') || key.startsWith('Rms_'))) {
      results.extra.push(key);
    }
  });
  
  // Display results
  console.log(`Original fields: ${results.totalOriginal}`);
  console.log(`Extracted fields: ${results.totalExtracted}`);
  console.log(`Matched fields: ${results.matched}`);
  console.log(`Missing fields: ${results.missing.length}`);
  console.log(`Different values: ${results.different.length}`);
  console.log(`Extra fields: ${results.extra.length}`);
  
  if (results.missing.length > 0) {
    console.log('\\nMissing fields:');
    results.missing.forEach(field => console.log(`  - ${field}`));
  }
  
  if (results.different.length > 0) {
    console.log('\\nFields with different values:');
    results.different.forEach(diff => {
      console.log(`  - ${diff.field}:`);
      console.log(`    Original: "${diff.original}"`);
      console.log(`    Extracted: "${diff.extracted}"`);
    });
  }
  
  if (results.extra.length > 0) {
    console.log('\\nExtra fields found:');
    results.extra.forEach(field => console.log(`  - ${field}`));
  }
  
  const successRate = (results.matched / results.totalOriginal) * 100;
  console.log(`\\n🎯 Roundtrip Success Rate: ${successRate.toFixed(1)}%`);
  
  return successRate >= 90; // Consider 90%+ success rate as good
}

function validateRMSCompliance(metadata) {
  console.log('\\nValidating RMS compliance...');
  
  const compliance = {
    hasProducer: false,
    hasSchemaDetail: false,
    hasVersion: false,
    hasRequiredFields: false,
    hasValidStructure: false,
    score: 0
  };
  
  // Check Producer field for RMS version
  if (metadata.producer && metadata.producer.includes('rms_v')) {
    compliance.hasProducer = true;
    compliance.score += 20;
    console.log('✓ Producer field indicates RMS compliance');
  } else {
    console.log('❌ Producer field missing or does not indicate RMS compliance');
  }
  
  // Check Schema Detail (try both cases)
  const schemaDetail = metadata.rms_schema_detail || metadata.Rms_schema_detail;
  if (schemaDetail === 'https://github.com/rezi-io/resume-standard') {
    compliance.hasSchemaDetail = true;
    compliance.score += 20;
    console.log('✓ Schema detail points to official RMS repository');
  } else {
    console.log('❌ Schema detail missing or incorrect');
  }
  
  // Check Version (try both cases)
  const version = metadata.rms_version || metadata.Rms_version;
  if (version) {
    compliance.hasVersion = true;
    compliance.score += 20;
    console.log(`✓ RMS version specified: ${version}`);
  } else {
    console.log('❌ RMS version field missing');
  }
  
  // Check required fields (try both cases)
  const fullName = metadata.rms_contact_fullName || metadata.Rms_contact_fullName;
  const email = metadata.rms_contact_email || metadata.Rms_contact_email;
  if (fullName && email) {
    compliance.hasRequiredFields = true;
    compliance.score += 20;
    console.log('✓ Required contact fields present');
  } else {
    console.log('❌ Missing required contact fields');
  }
  
  // Check structure (indexed fields)
  const countFields = Object.keys(metadata).filter(key => key.endsWith('_count'));
  if (countFields.length > 0) {
    compliance.hasValidStructure = true;
    compliance.score += 20;
    console.log(`✓ Valid indexed structure with ${countFields.length} sections`);
  } else {
    console.log('❌ No indexed structure found');
  }
  
  console.log(`\\n📊 RMS Compliance Score: ${compliance.score}/100`);
  
  return compliance.score >= 80; // 80%+ compliance score
}

async function runFullTest() {
  console.log('=== RMS Metadata Roundtrip Test ===\\n');
  
  try {
    // Step 1: Create test PDF
    await createTestPDF();
    
    // Step 2: Embed RMS metadata
    const embedSuccess = await embedRMSMetadata();
    if (!embedSuccess) {
      console.error('❌ Test failed: Could not embed metadata');
      return;
    }
    
    // Step 3: Extract RMS metadata
    const extractedData = await extractRMSMetadata();
    if (!extractedData) {
      console.error('❌ Test failed: Could not extract metadata');
      return;
    }
    
    // Step 4: Validate roundtrip
    const roundtripSuccess = validateRoundtrip(sampleRMSData, extractedData);
    
    // Step 5: Validate RMS compliance
    const complianceSuccess = validateRMSCompliance(extractedData);
    
    // Final results
    console.log('\\n=== Test Results ===');
    console.log(`Roundtrip Test: ${roundtripSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Compliance Test: ${complianceSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (roundtripSuccess && complianceSuccess) {
      console.log('\\n🎉 All tests PASSED! RMS implementation is working correctly.');
    } else {
      console.log('\\n⚠️  Some tests FAILED. Review the issues above.');
    }
    
    // Save extracted metadata for inspection
    fs.writeFileSync('extracted-rms-metadata.json', JSON.stringify(extractedData, null, 2));
    console.log('\\n📁 Extracted metadata saved to: extracted-rms-metadata.json');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  runFullTest().then(() => {
    console.log('\\nTest completed.');
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = {
  createTestPDF,
  embedRMSMetadata,
  extractRMSMetadata,
  validateRoundtrip,
  validateRMSCompliance,
  sampleRMSData
};