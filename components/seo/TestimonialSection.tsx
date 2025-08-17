'use client';

import { generateReviewSchema } from '@/lib/seo-utils';
import Image from 'next/image';

export interface Testimonial {
  author: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  date: string;
  avatar?: string;
}

interface TestimonialSectionProps {
  testimonials: Testimonial[];
  productName?: string;
  title?: string;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialSection({ 
  testimonials, 
  productName = 'Rezum AI',
  title = 'What Our Users Say',
  className = '' 
}: TestimonialSectionProps) {
  const schemas = testimonials.map(testimonial => 
    generateReviewSchema({
      itemName: productName,
      reviewBody: testimonial.content,
      ratingValue: testimonial.rating,
      authorName: testimonial.author,
      datePublished: testimonial.date,
    })
  );

  const aggregateRating = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
    },
    ratingValue: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
    reviewCount: testimonials.length,
    bestRating: 5,
    worstRating: 1,
  };

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRating) }}
      />
      
      <section className={`testimonial-section ${className}`}>
        <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col"
              itemScope
              itemType="https://schema.org/Review"
            >
              <div className="flex items-center mb-4">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar}
                    alt={`${testimonial.author} avatar`}
                    width={48}
                    height={48}
                    className="rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                      {testimonial.author[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{testimonial.author}</span>
                  </h3>
                  {(testimonial.role || testimonial.company) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                      {testimonial.role && testimonial.company && ' at '}
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-4" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                <meta itemProp="bestRating" content="5" />
                <StarRating rating={testimonial.rating} />
              </div>
              
              <blockquote className="flex-1 text-gray-700 dark:text-gray-300 italic" itemProp="reviewBody">
                "{testimonial.content}"
              </blockquote>
              
              <time 
                className="text-sm text-gray-500 dark:text-gray-400 mt-4"
                itemProp="datePublished"
                dateTime={testimonial.date}
              >
                {new Date(testimonial.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
              
              <meta itemProp="itemReviewed" content={productName} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}