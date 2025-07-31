'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface ThirdPartyScriptsProps {
  enableRecaptcha?: boolean;
  enableGTM?: boolean;
  enableGA?: boolean;
}

export default function ThirdPartyScripts({ 
  enableRecaptcha = false, 
  enableGTM = false,
  enableGA = false 
}: ThirdPartyScriptsProps) {
  return (
    <>
      {/* Google Tag Manager - Load with delay and only after user interaction */}
      {enableGTM && process.env.NEXT_PUBLIC_GTM_ID && (
        <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              // Load GTM only after user interaction or after 5 seconds
              let gtmLoaded = false;
              const loadGTM = () => {
                if (!gtmLoaded) {
                  gtmLoaded = true;
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                }
              };
              
              // Load on user interaction
              ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(event => {
                document.addEventListener(event, loadGTM, { once: true, passive: true });
              });
              
              // Fallback: load after 5 seconds
              setTimeout(loadGTM, 5000);
            `,
          }}
        />
      )}

      {/* Google Analytics - Load only when needed */}
      {enableGA && process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          />
        </>
      )}

      {/* reCAPTCHA - Load only when authentication pages are accessed */}
      {enableRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
          onLoad={() => {
            // Initialize reCAPTCHA with minimal DOM interaction
            if (typeof window !== 'undefined' && window.grecaptcha) {
              window.grecaptcha.enterprise.ready(() => {
                console.log('reCAPTCHA Enterprise loaded');
              });
            }
          }}
        />
      )}
    </>
  );
}