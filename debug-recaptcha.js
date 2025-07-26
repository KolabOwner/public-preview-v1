/**
 * Debug script to test reCAPTCHA Enterprise configuration
 * Run this on your production environment to diagnose the issue
 */

// Add this to your sign-in page temporarily for debugging
const debugRecaptcha = async () => {
  console.log('=== reCAPTCHA Enterprise Debug ===');
  
  // 1. Check environment variables
  console.log('Environment check:');
  console.log('- NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ? 'SET' : 'MISSING');
  console.log('- Domain:', window.location.host);
  
  // 2. Check if reCAPTCHA script loads
  try {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY}`;
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      setTimeout(reject, 10000); // 10 second timeout
    });
    
    console.log('✅ reCAPTCHA script loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load reCAPTCHA script:', error);
    return;
  }
  
  // 3. Test token generation
  try {
    await new Promise(resolve => {
      window.grecaptcha.enterprise.ready(resolve);
    });
    
    const token = await window.grecaptcha.enterprise.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY,
      { action: 'log_in' }
    );
    
    console.log('✅ reCAPTCHA token generated:', token.substring(0, 50) + '...');
    
    // 4. Test server assessment
    const response = await fetch('/api/auth/recaptcha/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        action: 'log_in',
        email: 'test@example.com'
      })
    });
    
    const result = await response.json();
    console.log('Server assessment result:', result);
    
    if (result.success) {
      console.log('✅ reCAPTCHA assessment passed');
    } else {
      console.error('❌ reCAPTCHA assessment failed:', result.assessment?.reason);
    }
    
  } catch (error) {
    console.error('❌ Token generation or assessment failed:', error);
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.debugRecaptcha = debugRecaptcha;
}