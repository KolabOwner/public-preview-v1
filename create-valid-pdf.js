const fs = require('fs');
const { jsPDF } = require('jspdf');

// Create a valid PDF using jsPDF
const doc = new jsPDF();

// Add some content
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

// Save the PDF
const pdfBuffer = doc.output('arraybuffer');
fs.writeFileSync('valid-test-resume.pdf', Buffer.from(pdfBuffer));

console.log('Valid test PDF created successfully using jsPDF');
