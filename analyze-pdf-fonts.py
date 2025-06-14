#!/usr/bin/env python3
import PyPDF2
import pdfplumber
import sys

def analyze_pdf_fonts(pdf_path):
    print(f"Analyzing PDF: {pdf_path}\n")
    
    try:
        # Try with PyPDF2 first
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"Number of pages: {len(pdf_reader.pages)}")
            
            # Try to extract metadata
            if pdf_reader.metadata:
                print("\nPDF Metadata:")
                for key, value in pdf_reader.metadata.items():
                    print(f"  {key}: {value}")
            
            # Extract text from first page
            if len(pdf_reader.pages) > 0:
                page = pdf_reader.pages[0]
                text = page.extract_text()
                print(f"\nFirst 500 characters of text:\n{text[:500]}...")
                
    except Exception as e:
        print(f"PyPDF2 error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    try:
        # Try with pdfplumber for more detailed analysis
        with pdfplumber.open(pdf_path) as pdf:
            print(f"PDF opened with pdfplumber")
            print(f"Number of pages: {len(pdf.pages)}")
            
            # Analyze first page
            if len(pdf.pages) > 0:
                page = pdf.pages[0]
                
                # Extract text
                text = page.extract_text()
                if text:
                    print(f"\nExtracted text preview (first 300 chars):")
                    print(text[:300] + "...")
                
                # Try to get character-level information
                chars = page.chars
                if chars:
                    # Collect unique font information
                    fonts = set()
                    font_sizes = set()
                    
                    for char in chars[:100]:  # Sample first 100 characters
                        if 'fontname' in char:
                            fonts.add(char['fontname'])
                        if 'size' in char:
                            font_sizes.add(round(char['size'], 1))
                    
                    print(f"\nUnique fonts found: {fonts}")
                    print(f"Font sizes found: {sorted(font_sizes)}")
                    
                    # Show sample character details
                    print("\nSample character details (first 5):")
                    for i, char in enumerate(chars[:5]):
                        print(f"  Char {i}: '{char.get('text', '')}' - Font: {char.get('fontname', 'N/A')} - Size: {char.get('size', 'N/A')}")
                
    except Exception as e:
        print(f"pdfplumber error: {e}")

if __name__ == "__main__":
    analyze_pdf_fonts("good-fonts.pdf")