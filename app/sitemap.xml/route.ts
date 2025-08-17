import { NextResponse } from 'next/server';

// Define all static pages with their metadata
const staticPages = [
  // High Priority Marketing Pages
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/ai-resume-builder', priority: 0.9, changefreq: 'weekly' },
  { path: '/ai-cover-letter-builder', priority: 0.9, changefreq: 'weekly' },
  { path: '/resume-templates', priority: 0.9, changefreq: 'weekly' },
  { path: '/cover-letter-templates', priority: 0.9, changefreq: 'weekly' },
  { path: '/resume-examples', priority: 0.8, changefreq: 'weekly' },
  { path: '/keyword-scanner', priority: 0.8, changefreq: 'weekly' },
  { path: '/resume-checker', priority: 0.8, changefreq: 'weekly' },
  { path: '/resume-bullet-point-generator', priority: 0.8, changefreq: 'weekly' },
  { path: '/ai-resume-summary-generator', priority: 0.8, changefreq: 'weekly' },
  
  // Core Pages
  { path: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog', priority: 0.7, changefreq: 'daily' },
  
  // Legal/Info Pages
  { path: '/legal', priority: 0.5, changefreq: 'monthly' },
  { path: '/editorial-process', priority: 0.5, changefreq: 'monthly' },
  { path: '/docs/ai-keyword-targeting', priority: 0.6, changefreq: 'monthly' },
  
  // Auth Pages (important for user experience)
  { path: '/sign-in', priority: 0.8, changefreq: 'monthly' },
  { path: '/sign-up', priority: 0.8, changefreq: 'monthly' },
  { path: '/forgot-password', priority: 0.6, changefreq: 'monthly' },
];

// Sample/Industry pages that should be indexed for SEO
const samplePages = [
  { industry: 'business', name: 'Business' },
  { industry: 'programming', name: 'Programming & Software Development' },
  { industry: 'design', name: 'Design & Creative' },
  { industry: 'education', name: 'Education & Teaching' },
  { industry: 'engineering', name: 'Engineering' },
  { industry: 'finance', name: 'Finance & Banking' },
  { industry: 'legal', name: 'Legal & Law' },
  { industry: 'marketing', name: 'Marketing & Advertising' },
  { industry: 'medical', name: 'Medical & Healthcare' },
  { industry: 'student', name: 'Student & Entry Level' },
  { industry: 'other', name: 'Other Industries' },
];

// Template categories (if you have specific template pages)
const templateCategories = [
  'professional',
  'modern',
  'creative',
  'simple',
  'executive',
  'technical',
  'academic',
];

// Generate XML sitemap
function generateSitemapXML(baseUrl: string): string {
  const currentDate = new Date().toISOString();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add sample/industry pages
  samplePages.forEach(sample => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/dashboard/samples/${sample.industry}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add template category pages (if they exist)
  templateCategories.forEach(category => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/resume-templates/${category}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
    
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/cover-letter-templates/${category}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Route handler for /sitemap.xml
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rezum-ai.com';
  
  try {
    const sitemap = generateSitemapXML(baseUrl);
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap if there's an error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}