import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = 'https://www.rezum-ai.com';
  const defaultImage = `${baseUrl}/og-image.png`;
  
  const {
    title,
    description,
    keywords,
    image = defaultImage,
    url = baseUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
  } = config;

  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return {
    title: `${title} | Rezum AI`,
    description,
    keywords: keywordsString,
    authors: author ? [{ name: author }] : [{ name: 'Rezum AI Team' }],
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description,
      url,
      siteName: 'Rezum AI',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@rezumai',
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || 'https://www.rezum-ai.com/og-image.png',
    publisher: {
      '@type': 'Organization',
      name: 'Rezum AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.rezum-ai.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'https://schema.org/InStock',
  ratingValue,
  reviewCount,
  brand = 'Rezum AI',
}: {
  name: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  ratingValue?: number;
  reviewCount?: number;
  brand?: string;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
  };

  if (image) {
    schema.image = image;
  }

  if (price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability,
    };
  }

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
    };
  }

  return schema;
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rezum AI',
    url: 'https://www.rezum-ai.com',
    logo: 'https://www.rezum-ai.com/logo.png',
    description: 'AI-powered resume builder and career tools platform',
    sameAs: [
      'https://twitter.com/rezumai',
      'https://linkedin.com/company/rezumai',
      'https://facebook.com/rezumai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
}

export function generateServiceSchema({
  name,
  description,
  provider = 'Rezum AI',
  serviceType,
  areaServed = 'Worldwide',
  availableChannel,
}: {
  name: string;
  description: string;
  provider?: string;
  serviceType: string;
  areaServed?: string;
  availableChannel?: {
    url: string;
    name: string;
  };
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    serviceType,
    areaServed,
  };

  if (availableChannel) {
    schema.availableChannel = {
      '@type': 'ServiceChannel',
      serviceUrl: availableChannel.url,
      name: availableChannel.name,
    };
  }

  return schema;
}

export function generateReviewSchema({
  itemName,
  reviewBody,
  ratingValue,
  authorName,
  datePublished,
}: {
  itemName: string;
  reviewBody: string;
  ratingValue: number;
  authorName: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: itemName,
    },
    reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue.toString(),
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished,
  };
}

export function generateLocalBusinessSchema({
  name,
  description,
  address,
  telephone,
  email,
  openingHours,
  priceRange,
}: {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  openingHours?: string[];
  priceRange?: string;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
  };

  if (telephone) schema.telephone = telephone;
  if (email) schema.email = email;
  if (openingHours) schema.openingHours = openingHours;
  if (priceRange) schema.priceRange = priceRange;

  return schema;
}

export function generateJobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
  baseSalary,
}: {
  title: string;
  description: string;
  datePosted: string;
  validThrough: string;
  employmentType: string;
  hiringOrganization: string;
  jobLocation: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  baseSalary?: {
    value: number;
    currency: string;
  };
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    validThrough,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: hiringOrganization,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...jobLocation,
      },
    },
  };

  if (baseSalary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: baseSalary.currency,
      value: {
        '@type': 'QuantitativeValue',
        value: baseSalary.value,
        unitText: 'YEAR',
      },
    };
  }

  return schema;
}