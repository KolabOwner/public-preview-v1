'use client';

import { useEffect } from 'react';

export default function AsyncCSS() {
  useEffect(() => {
    // Only load Font Awesome if icons are actually used on this page
    const hasIcons = document.querySelector('[class*="fa-"]') || document.querySelector('.fad, .fas, .far');
    
    if (!hasIcons) return;

    // Create and append the FontAwesome stylesheet asynchronously
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    
    // Add preload for the font file itself
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2';
    preloadLink.as = 'font';
    preloadLink.type = 'font/woff2';
    preloadLink.crossOrigin = 'anonymous';
    
    // Check if not already loaded
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(preloadLink);
      document.head.appendChild(link);
    }
  }, []);

  return null;
}