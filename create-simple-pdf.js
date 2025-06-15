const fs = require('fs');

// Simple test to generate a basic PDF using a minimal structure
const basicPDF = `%PDF-1.3
%âãÏÓ
1 0 obj
<<
/Type /Catalog
/Outlines 2 0 R
/Pages 3 0 R
>>
endobj

2 0 obj
<<
/Type /Outlines
/Count 0
>>
endobj

3 0 obj
<<
/Type /Pages
/Count 1
/Kids [4 0 R]
>>
endobj

4 0 obj
<<
/Type /Page
/Parent 3 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Times-Roman
    >>
  >>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

5 0 obj
<<
/Length 73
>>
stream
BT
/F1 18 Tf
0 0 0 rg
100 700 Td
(Test Resume Document) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000079 00000 n
0000000126 00000 n
0000000183 00000 n
0000000364 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
441
%%EOF`;

fs.writeFileSync('simple-test-resume.pdf', basicPDF);
console.log('Simple test PDF created successfully');
