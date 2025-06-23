// lib/pdf-rms-validator.ts

export interface RMSValidationResult {
  isValid: boolean;
  isRMSCompliant: boolean;
  version?: string;
  errors: string[];
  warnings: string[];
  fieldCount: number;
  missingRequiredFields: string[];
  detectedSections: string[];
}

/**
 * Validate extracted RMS metadata against official specification
 */
export function validateRMSMetadata(metadata: any): RMSValidationResult {
  const result: RMSValidationResult = {
    isValid: false,
    isRMSCompliant: false,
    errors: [],
    warnings: [],
    fieldCount: 0,
    missingRequiredFields: [],
    detectedSections: []
  };

  if (!metadata || typeof metadata !== 'object') {
    result.errors.push('No metadata provided or invalid format');
    return result;
  }

  // Count all RMS fields (handle both cases)
  const rmsFields = Object.keys(metadata).filter(key => key.startsWith('rms_') || key.startsWith('Rms_'));
  result.fieldCount = rmsFields.length;

  // Check for RMS version compliance
  const producer = metadata.producer;
  if (producer && typeof producer === 'string' && producer.includes('rms_v')) {
    result.isRMSCompliant = true;
    const versionMatch = producer.match(/rms_v(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }
  } else {
    result.warnings.push('Producer field does not indicate RMS version compliance');
  }

  // Check for schema detail (handle both cases)
  const schemaDetail = metadata.rms_schema_detail || metadata.Rms_schema_detail;
  if (!schemaDetail) {
    result.warnings.push('Missing rms_schema_detail field');
  } else if (schemaDetail !== 'https://github.com/rezi-io/resume-standard') {
    result.warnings.push('Schema detail does not match official RMS repository');
  }

  // Validate required sections (handle both cases)
  const requiredFields = [
    { field: 'rms_contact_fullName', altField: 'Rms_contact_fullName' },
    { field: 'rms_contact_email', altField: 'Rms_contact_email' }
  ];

  requiredFields.forEach(({ field, altField }) => {
    const value = metadata[field] || metadata[altField];
    if (!value || value.trim() === '') {
      result.missingRequiredFields.push(field);
    }
  });

  // Detect sections based on count fields (handle both cases)
  const sectionCounts = {
    experience: metadata.rms_experience_count || metadata.Rms_experience_count || 0,
    education: metadata.rms_education_count || metadata.Rms_education_count || 0,
    skills: metadata.rms_skill_count || metadata.Rms_skill_count || 0,
    projects: metadata.rms_project_count || metadata.Rms_project_count || 0,
    involvement: metadata.rms_involvement_count || metadata.Rms_involvement_count || 0,
    certifications: metadata.rms_certification_count || metadata.Rms_certification_count || 0,
    coursework: metadata.rms_coursework_count || metadata.Rms_coursework_count || 0,
    publications: metadata.rms_publication_count || metadata.Rms_publication_count || 0,
    awards: metadata.rms_award_count || metadata.Rms_award_count || 0,
    references: metadata.rms_reference_count || metadata.Rms_reference_count || 0
  };

  Object.entries(sectionCounts).forEach(([section, count]) => {
    if (count > 0) {
      result.detectedSections.push(section);
      
      // Validate that indexed fields exist for this section
      for (let i = 0; i < count; i++) {
        validateSectionFields(metadata, section, i, result);
      }
    }
  });

  // Contact information validation
  validateContactFields(metadata, result);

  // Summary validation
  if (metadata.rms_summary && metadata.rms_summary.length > 1000) {
    result.warnings.push('Summary field is unusually long (>1000 characters)');
  }

  // Overall validation
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Validate fields for a specific section and index
 */
function validateSectionFields(metadata: any, section: string, index: number, result: RMSValidationResult) {
  const prefix = `rms_${section}_${index}`;

  switch (section) {
    case 'experience':
      validateRequiredField(metadata, `${prefix}_company`, result);
      validateRequiredField(metadata, `${prefix}_role`, result);
      validateDateField(metadata, `${prefix}_dateBegin`, result);
      break;

    case 'education':
      validateRequiredField(metadata, `${prefix}_institution`, result);
      validateRequiredField(metadata, `${prefix}_qualification`, result);
      break;

    case 'skills':
      validateRequiredField(metadata, `${prefix}_keywords`, result);
      break;

    case 'projects':
      validateRequiredField(metadata, `${prefix}_title`, result);
      break;

    case 'involvement':
      validateRequiredField(metadata, `${prefix}_organization`, result);
      break;

    case 'certifications':
      validateRequiredField(metadata, `${prefix}_name`, result);
      break;

    default:
      // Generic validation for other sections
      break;
  }
}

/**
 * Validate contact information fields
 */
function validateContactFields(metadata: any, result: RMSValidationResult) {
  // Email validation
  if (metadata.rms_contact_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(metadata.rms_contact_email)) {
      result.errors.push('Invalid email format in rms_contact_email');
    }
  }

  // Phone validation (basic)
  if (metadata.rms_contact_phone) {
    const phoneRegex = /[\d\s\-\(\)\+]{7,}/;
    if (!phoneRegex.test(metadata.rms_contact_phone)) {
      result.warnings.push('Phone number format may not be standard');
    }
  }

  // LinkedIn validation
  if (metadata.rms_contact_linkedin) {
    if (!metadata.rms_contact_linkedin.includes('linkedin.com')) {
      result.warnings.push('LinkedIn URL does not appear to be valid');
    }
  }

  // Website validation
  if (metadata.rms_contact_website) {
    try {
      new URL(metadata.rms_contact_website);
    } catch {
      result.warnings.push('Website URL format appears invalid');
    }
  }
}

/**
 * Validate that a required field exists and is not empty
 */
function validateRequiredField(metadata: any, fieldName: string, result: RMSValidationResult) {
  if (!metadata[fieldName] || metadata[fieldName].trim() === '') {
    result.warnings.push(`Missing or empty required field: ${fieldName}`);
  }
}

/**
 * Validate date field format
 */
function validateDateField(metadata: any, fieldName: string, result: RMSValidationResult) {
  const dateValue = metadata[fieldName];
  if (dateValue && dateValue !== 'Present') {
    // Check for common date formats
    const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$|^\d{1,2}\/\d{4}$|^\d{4}$/;
    if (!dateRegex.test(dateValue)) {
      result.warnings.push(`Date field ${fieldName} has unusual format: ${dateValue}`);
    }
  }
}

/**
 * Generate a human-readable validation report
 */
export function generateValidationReport(validation: RMSValidationResult): string {
  const lines: string[] = [];
  
  lines.push('=== RMS Metadata Validation Report ===');
  lines.push(`Overall Valid: ${validation.isValid ? 'YES' : 'NO'}`);
  lines.push(`RMS Compliant: ${validation.isRMSCompliant ? 'YES' : 'NO'}`);
  
  if (validation.version) {
    lines.push(`RMS Version: ${validation.version}`);
  }
  
  lines.push(`Total RMS Fields: ${validation.fieldCount}`);
  lines.push(`Detected Sections: ${validation.detectedSections.join(', ') || 'None'}`);
  
  if (validation.errors.length > 0) {
    lines.push('\nERRORS:');
    validation.errors.forEach(error => lines.push(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    lines.push('\nWARNINGS:');
    validation.warnings.forEach(warning => lines.push(`  - ${warning}`));
  }
  
  if (validation.missingRequiredFields.length > 0) {
    lines.push('\nMISSING REQUIRED FIELDS:');
    validation.missingRequiredFields.forEach(field => lines.push(`  - ${field}`));
  }
  
  return lines.join('\n');
}

/**
 * Check if metadata appears to be RMS compliant based on field patterns
 */
export function detectRMSCompliance(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  // Check for RMS version in producer
  const producer = metadata.producer;
  if (producer && typeof producer === 'string' && producer.includes('rms_v')) {
    return true;
  }

  // Check for RMS schema detail
  if (metadata.rms_schema_detail === 'https://github.com/rezi-io/resume-standard') {
    return true;
  }

  // Check for presence of RMS fields (handle both cases)
  const rmsFields = Object.keys(metadata).filter(key => key.startsWith('rms_') || key.startsWith('Rms_'));
  return rmsFields.length >= 3; // At least a few RMS fields present
}