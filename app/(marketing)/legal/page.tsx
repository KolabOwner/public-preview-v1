import React from 'react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-600 py-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">AI Resume</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/ai-resume-builder" className="hover:text-slate-900 transition-colors">AI Resume Builder</a></li>
              <li><a href="/ai-resume-summary-generator" className="hover:text-slate-900 transition-colors">Resume Summary Generator</a></li>
              <li><a href="/keyword-scanner" className="hover:text-slate-900 transition-colors">AI Keyword Scanner</a></li>
              <li><a href="/resume-checker" className="hover:text-slate-900 transition-colors">ATS Resume Checker</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Resume Guides</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.rezi.ai/posts/how-to-write-a-resume" className="hover:text-slate-900 transition-colors">How to Write a Resume</a></li>
              <li><a href="https://www.rezi.ai/posts/resume-format" className="hover:text-slate-900 transition-colors">Guide to Resume Formatting</a></li>
              <li><a href="https://www.rezi.ai/posts/resume-summary-examples" className="hover:text-slate-900 transition-colors">Guide to Resume Summary</a></li>
              <li><a href="https://www.rezi.ai/posts/ats-resume-keywords" className="hover:text-slate-900 transition-colors">Guide to Resume Keywords</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Examples & Templates</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/resume-templates" className="hover:text-slate-900 transition-colors">Resume Formats/Templates</a></li>
              <li><a href="/resume-templates/simple-resume-templates" className="hover:text-slate-900 transition-colors">Standard Resume Template</a></li>
              <li><a href="/resume-templates/compact-resume-templates" className="hover:text-slate-900 transition-colors">Compact Resume Templates</a></li>
              <li><a href="/resume-examples" className="hover:text-slate-900 transition-colors">Resume Examples</a></li>
              <li><a href="/cover-letter-templates" className="hover:text-slate-900 transition-colors">Cover Letter Examples</a></li>
              <li><a href="/resignation-letter-templates" className="hover:text-slate-900 transition-colors">Resignation Letter Examples</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">AI Career Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/ai-cover-letter-builder" className="hover:text-slate-900 transition-colors">Cover Letter Writer</a></li>
              <li><a href="/ai-interview" className="hover:text-slate-900 transition-colors">Interactive Interview Practice</a></li>
              <li><a href="/ai-resignation-letter-builder" className="hover:text-slate-900 transition-colors">Resignation Letter Writer</a></li>
              <li><a href="/job-search" className="hover:text-slate-900 transition-colors">Job Search</a></li>
              <li><a href="https://app.rezi.ai/signup" className="hover:text-slate-900 transition-colors">Human Resume Review</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</a></li>
              <li><a href="/enterprise" className="hover:text-slate-900 transition-colors">Kolab Enterprise</a></li>
              <li><a href="/linkedin-resume-builder" className="hover:text-slate-900 transition-colors">Linkedin Extension</a></li>
              <li><a href="/rezi-reviews" className="hover:text-slate-900 transition-colors">User Reviews</a></li>
              <li><a href="/rezi-docs" className="hover:text-slate-900 transition-colors">User Guides</a></li>
              <li><a href="/blog" className="hover:text-slate-900 transition-colors">Career Blog</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-slate-900 transition-colors">About Us</a></li>
              <li><a href="/authors" className="hover:text-slate-900 transition-colors">Authors</a></li>
              <li><a href="/editorial-process" className="hover:text-slate-900 transition-colors">Editorial Process</a></li>
              <li><a id="book_demo" href="#" className="hover:text-slate-900 transition-colors">Contact Support</a></li>
              <li><a href="/contact-sales" className="hover:text-slate-900 transition-colors">Contact Sales</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" aria-current="page">
              
            </a>
            <div className="text-sm text-slate-500">
              Join over 3,365,312 job seekers helped since September 2019
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-sm text-slate-500">© 2025 Kolab</div>
            <a href="/legal" className="text-sm hover:text-slate-900 transition-colors">Terms & Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Legal Page Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Legal Information
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy &
              <span className="text-blue-600 block">Terms of Use</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your privacy and trust are important to us. Please review our policies
              to understand how we handle your information and the terms that govern our service.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Terms of Use Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Terms of Use
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using our website and services, you agree to be bound by these Terms of Use, 
                  all applicable laws and regulations, and agree that you are responsible for compliance with any 
                  applicable local laws. If you do not agree with any of these terms, you are prohibited from using 
                  or accessing this site. The materials contained in this website are protected by applicable copyright 
                  and trademark law.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h3>
                <p>
                  Permission is granted to temporarily use our website for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Modify or copy the materials;</li>
                  <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
                  <li>Attempt to decompile or reverse engineer any software contained on our website;</li>
                  <li>Remove any copyright or other proprietary notations from the materials; or</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>
                <p className="mt-4">
                  This license shall automatically terminate if you violate any of these restrictions and may be 
                  terminated by us at any time. Upon terminating your viewing of these materials or upon the 
                  termination of this license, you must destroy any downloaded materials in your possession whether 
                  in electronic or printed format.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Service Disclaimer</h3>
                <p>
                  The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or 
                  implied, and hereby disclaim and negate all other warranties including, without limitation, implied 
                  warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                  of intellectual property or other violation of rights.
                </p>
                <p className="mt-4">
                  Further, we do not warrant or make any representations concerning the accuracy, likely results, 
                  or reliability of the use of the materials on our website or otherwise relating to such materials 
                  or on any sites linked to this site.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Limitations</h3>
                <p>
                  In no event shall Kolab AI or its suppliers be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                  to use the materials on our website, even if Kolab AI or our authorized representative has been notified orally 
                  or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on 
                  implied warranties, or limitations of liability for consequential or incidental damages, these limitations 
                  may not apply to you.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Material Accuracy</h3>
                <p>
                  The materials appearing on our website could include technical, typographical, or photographic errors. 
                  We do not warrant that any of the materials on our website are accurate, complete, or current. We may 
                  make changes to the materials contained on our website at any time without notice. However, we do not 
                  make any commitment to update the materials.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Links</h3>
                <p>
                  We have not reviewed all of the sites linked to our website and are not responsible for the contents 
                  of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use 
                  of any such linked website is at the user's own risk.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Modifications</h3>
                <p>
                  We may revise these Terms of Use for our website at any time without notice. By using this website, 
                  you are agreeing to be bound by the then current version of these Terms of Use.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Governing Law</h3>
                <p>
                  These Terms of Use and your use of this website are governed by and construed in accordance with 
                  the laws of the jurisdiction in which Kolab AI operates, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div className="border-t border-gray-200 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
              <div>
                <p className="text-lg">
                  Your privacy is important to us. This Privacy Policy explains how Kolab AI collects, uses, and protects 
                  your information when you use our services. We are committed to the following principles:
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 pl-4 py-4 mt-4 space-y-2">
                  <p className="font-medium">We are thoughtful about the personal information we ask you to provide and collect through our services.</p>
                  <p className="font-medium">We store personal information only as long as we have a reason to keep it.</p>
                  <p className="font-medium">We aim to make it simple for you to control what information is shared publicly or kept private.</p>
                  <p className="font-medium">We aim for full transparency on how we gather, use, and share your personal information.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Who We Are and What This Policy Covers</h3>
                <p>
                  This Privacy Policy applies to information that Kolab AI collects about you when you use our website, 
                  mobile applications, and related services (collectively, our "Services").
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h3>
                <p>
                  We only collect information about you if we have a reason to do so — for example, to provide our 
                  Services, to communicate with you, or to make our Services better. We collect information in 
                  three ways: if and when you provide information to us, automatically through operating our Services, 
                  and from outside sources.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Information You Provide to Us</h3>
                <p>
                  The amount and type of information depends on the context and how we use the information. 
                  Here are some examples:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Basic Account Information:</strong> We ask for basic information from you in order to set up your account. 
                    For example, we require individuals who sign up to provide an email address and create a password.
                  </li>
                  <li>
                    <strong>Content Information:</strong> Depending on the Services you use, you may provide us with information 
                    about you in forms such as resumes, cover letters, or other career documents. This information is stored 
                    securely and used only to provide our Services to you.
                  </li>
                  <li>
                    <strong>Communications With Us:</strong> You may provide us information when you respond to surveys, 
                    communicate with our support team, or reach out to us in other ways.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect Automatically</h3>
                <p>
                  We also collect some information automatically when you use our Services:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Usage Information:</strong> We collect information about your usage of our Services, such as 
                    the features you use, the actions you take, and the time, frequency, and duration of your activities.
                  </li>
                  <li>
                    <strong>Device Information:</strong> We collect information about your device, including the type of device, 
                    operating system, browser type, IP address, and device identifiers.
                  </li>
                  <li>
                    <strong>Location Information:</strong> We may collect information about your location if you enable 
                    location services on your device.
                  </li>
                  <li>
                    <strong>Cookies & Similar Technologies:</strong> We use cookies and similar technologies to collect 
                    information about your browsing behavior and preferences.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect from Other Sources</h3>
                <p>
                  We may also get information about you from other sources, such as when you create or log into your 
                  account through another service (like Google or LinkedIn), we will receive information from that service 
                  via the authorization procedures used by that service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How and Why We Use Information</h3>
                <p>
                  We use information about you for the purposes listed below:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>To provide our Services — for example, to set up and maintain your account, process your documents, and provide customer support;</li>
                  <li>To further develop and improve our Services — for example by adding new features that we think our users will enjoy;</li>
                  <li>To monitor and analyze trends and better understand how users interact with our Services;</li>
                  <li>To measure, gauge, and improve the effectiveness of our advertising and marketing;</li>
                  <li>To monitor and prevent any problems with our Services, protect security, detect and prevent fraud;</li>
                  <li>To communicate with you about updates, offers, and important notices;</li>
                  <li>To personalize your experience and provide content recommendations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sharing Information</h3>
                <p>
                  We do not sell our users' private personal information. We share information about you in the limited 
                  circumstances spelled out below and with appropriate safeguards on your privacy:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> We may share information with third-party vendors who need to know 
                    information about you in order to provide their services to us, such as payment processors, hosting 
                    providers, and customer support services.
                  </li>
                  <li>
                    <strong>Legal Requests:</strong> We may disclose information about you in response to a subpoena, 
                    court order, or other governmental request.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or 
                    acquisition of all or a portion of our business by another company.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> We may share and disclose information with your consent or at your direction.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h3>
                <p>
                  You have several choices available when it comes to information about you:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Access and Update:</strong> You can access and update your account information at any time 
                    through your account settings.
                  </li>
                  <li>
                    <strong>Delete Your Account:</strong> You can delete your account and all associated data at any time 
                    through your account settings.
                  </li>
                  <li>
                    <strong>Opt-Out of Communications:</strong> You may opt out of receiving promotional messages from us 
                    by following the instructions in those messages.
                  </li>
                  <li>
                    <strong>Cookie Controls:</strong> You can set your browser to refuse cookies or to alert you when 
                    cookies are being sent.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h3>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. However, please note 
                  that no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h3>
                <p>
                  We retain your personal information only for as long as necessary to provide you with our Services 
                  and for legitimate and essential business purposes, such as maintaining the performance of our Services, 
                  making data-driven business decisions, complying with our legal obligations, and resolving disputes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Children's Privacy</h3>
                <p>
                  Our Services are not directed to children under 13 years of age. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe that your child has 
                  provided us with personal information, please contact us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="font-medium">Email: privacy@kolab.ai</p>
                  <p className="font-medium">Company: Kolab AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}