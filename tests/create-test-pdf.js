// Create a more realistic test PDF
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new PDF document
const doc = new PDFDocument();

// Output file
const outputPath = path.join(__dirname, 'test-resume.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Add metadata
doc.info.Title = 'John Doe Resume';
doc.info.Author = 'John Doe';
doc.info.Subject = 'Software Engineer Resume';
doc.info.Keywords = 'React, Node.js, TypeScript, AWS';
doc.info.Producer = 'Test PDF Generator with RMS';

// Add content
doc.fontSize(16).text('John Doe', { align: 'center' });
doc.fontSize(12).text('johndoe@email.com | (555) 123-4567 | linkedin.com/in/johndoe', { align: 'center' });
doc.moveDown();

doc.fontSize(14).text('PROFESSIONAL SUMMARY');
doc.fontSize(11).text('Experienced Full Stack Software Engineer with 5+ years developing scalable web applications. Proficient in React, Node.js, TypeScript, and cloud technologies.');
doc.moveDown();

doc.fontSize(14).text('EXPERIENCE');
doc.fontSize(12).text('Senior Software Engineer');
doc.fontSize(11).text('Tech Company Inc. | San Francisco, CA | Jan 2021 - Present');
doc.text('• Led development of microservices architecture serving 2M+ users');
doc.text('• Reduced API response time by 40% through optimization');
doc.text('• Mentored 3 junior developers and conducted code reviews');
doc.moveDown();

doc.fontSize(14).text('EDUCATION');
doc.fontSize(11).text('Bachelor of Science in Computer Science');
doc.text('University of California, Berkeley | May 2018');
doc.text('GPA: 3.8/4.0');
doc.moveDown();

doc.fontSize(14).text('SKILLS');
doc.fontSize(11).text('Languages: JavaScript, TypeScript, Python, Java, SQL');
doc.text('Frontend: React, Redux, Next.js, HTML/CSS, Tailwind CSS');
doc.text('Backend: Node.js, Express, GraphQL, MongoDB, PostgreSQL');
doc.text('Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes');

// Finalize PDF
doc.end();

console.log('Test PDF created at:', outputPath);
console.log('\nNow you can:');
console.log('1. Add RMS metadata using ExifTool:');
console.log('   exiftool -config config/exiftool/rms-config.pl -XMP-rms:contact_fullName="John Doe" test-resume.pdf');
console.log('2. Run the test with: node tests/test-genkit-ats.js');