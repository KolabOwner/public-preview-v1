// test-rms-optimization.js
// Test the RMS optimization logic

const fs = require('fs');

// Sample RMS metadata (like what we extract)
const completeRMSMetadata = {
  "Rms_contact_fullName": "John Doe",
  "Rms_contact_email": "john.doe@email.com",
  "Rms_experience_count": 2,
  "Rms_education_count": 1,
  "Rms_skill_count": 2,
  "Rms_version": "v2.0.1",
  "Producer": "rms_v2.0.1",
  "Rms_experience_0_company": "Tech Corp",
  "Rms_experience_0_role": "Senior Software Engineer",
  // ... more fields
};

const incompleteRMSMetadata = {
  "Rms_contact_fullName": "John Doe",
  // Missing email and other critical fields
};

// Simulate the helper functions (copied from PDFProcessor)
function isCompleteRMSData(rmsMetadata) {
  const hasContact = rmsMetadata.rms_contact_fullName || rmsMetadata.Rms_contact_fullName;
  const hasEmail = rmsMetadata.rms_contact_email || rmsMetadata.Rms_contact_email;
  
  const hasExperience = (rmsMetadata.rms_experience_count || rmsMetadata.Rms_experience_count) > 0;
  const hasEducation = (rmsMetadata.rms_education_count || rmsMetadata.Rms_education_count) > 0;
  const hasSkills = (rmsMetadata.rms_skill_count || rmsMetadata.Rms_skill_count) > 0;
  
  const hasVersion = rmsMetadata.rms_version || rmsMetadata.Rms_version || 
                    (rmsMetadata.producer && rmsMetadata.producer.includes('rms_v'));
  
  const isComplete = hasContact && hasEmail && hasVersion && (hasExperience || hasEducation || hasSkills);
  
  console.log(`RMS Completeness Check:`, {
    hasContact,
    hasEmail,
    hasVersion,
    hasExperience,
    hasEducation,
    hasSkills,
    isComplete
  });
  
  return isComplete;
}

function convertRMSToParseFormat(rmsMetadata) {
  const getField = (fieldName) => {
    return rmsMetadata[fieldName] || rmsMetadata[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)];
  };

  const parsedData = {
    contactInfo: {
      fullName: getField('rms_contact_fullName') || '',
      email: getField('rms_contact_email') || '',
      phone: getField('rms_contact_phone') || '',
    },
    summary: getField('rms_summary') || '',
    experiences: [],
    education: [],
    skillCategories: []
  };

  // Convert experiences
  const expCount = getField('rms_experience_count') || 0;
  for (let i = 0; i < expCount; i++) {
    const prefix = `rms_experience_${i}`;
    parsedData.experiences.push({
      title: getField(`${prefix}_role`) || '',
      company: getField(`${prefix}_company`) || '',
      location: getField(`${prefix}_location`) || '',
      startDate: getField(`${prefix}_dateBegin`) || '',
      endDate: getField(`${prefix}_dateEnd`) || '',
      current: getField(`${prefix}_isCurrent`) === 'true' || getField(`${prefix}_dateEnd`) === 'Present',
      description: getField(`${prefix}_description`) || ''
    });
  }

  return parsedData;
}

// Test the functions
console.log('=== Testing RMS Optimization Logic ===\\n');

console.log('1. Testing Complete RMS Metadata:');
const isComplete = isCompleteRMSData(completeRMSMetadata);
console.log(`Result: ${isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}\\n`);

console.log('2. Testing Incomplete RMS Metadata:');
const isIncomplete = isCompleteRMSData(incompleteRMSMetadata);
console.log(`Result: ${isIncomplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}\\n`);

if (isComplete) {
  console.log('3. Testing RMS to Parse Format Conversion:');
  const convertedData = convertRMSToParseFormat(completeRMSMetadata);
  console.log('Converted data:', JSON.stringify(convertedData, null, 2));
  
  console.log('\\n🎯 Optimization Benefits:');
  console.log('✅ Skip expensive AI parsing when RMS metadata is complete');
  console.log('✅ Faster processing time (seconds vs minutes)');
  console.log('✅ More accurate data (no AI interpretation errors)');
  console.log('✅ Consistent results');
  console.log('✅ Reduced API costs');
}

console.log('\\n=== Test Complete ===');