// app/ai-resume-editor/page.tsx
import React from 'react';
import { Sparkles, CheckCircle, ArrowRight, Upload, Target, Shield, Star } from 'lucide-react';
import MainNavbar from '@/components/layout/main-navbar';

export default function AIResumeEditorPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      {/* Header/Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                AI Resume Editor
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Enhance Your Resume
              <span className="text-purple-600 block">With AI-Powered Editing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your existing resume content with intelligent suggestions. 
              Our AI editor helps you craft compelling bullet points that showcase your achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                Start Editing Free
              </button>
              <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg border border-purple-600 hover:bg-purple-50 transition-colors">
                See How It Works
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Trusted by professionals at Fortune 500 companies</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">Tesla</div>
                <div className="text-2xl font-bold text-gray-400">IBM</div>
                <div className="text-2xl font-bold text-gray-400">Oracle</div>
                <div className="text-2xl font-bold text-gray-400">Adobe</div>
                <div className="text-2xl font-bold text-gray-400">Spotify</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2.1M+</div>
              <div className="text-gray-600 font-medium">Resumes Enhanced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
              <div className="text-gray-600 font-medium">Improvement Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">3.5x</div>
              <div className="text-gray-600 font-medium">More Interviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
              <div className="text-gray-600 font-medium">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Edit Your Resume in 
              <span className="text-purple-600 block">Three Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered editor streamlines the resume enhancement process, 
              making it easy to create impactful content.
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Upload Your Resume</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Start by uploading your existing resume or paste your content directly into our editor. 
                We support all major formats including PDF, Word, and plain text.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Automatic format detection</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Secure and confidential processing</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
              <div className="bg-white p-6 rounded">
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Drop your resume here or click to browse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 md:order-1 bg-gray-100 p-8 rounded-lg shadow-lg">
              <div className="bg-white p-6 rounded">
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded cursor-pointer border-2 border-purple-500">
                    <p className="text-sm text-gray-800">
                      &#34;Managed daily operations and customer service tasks&#34;
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-purple-50 transition-colors">
                    <p className="text-sm text-gray-800">
                      &#34;Worked with team members on various projects&#34;
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Select Content to Enhance</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Simply highlight any bullet point, sentence, or section you want to improve. 
                Our AI will analyze the context and provide intelligent suggestions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Context-aware suggestions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Industry-specific optimization</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Choose Your Enhanced Version</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Review multiple AI-generated alternatives and select the one that best represents 
                your achievements. Each suggestion is optimized for impact and clarity.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Multiple variations to choose from</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Quantified achievements emphasized</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
              <div className="bg-white p-6 rounded">
                <p className="text-sm text-gray-600 mb-4">AI-Enhanced Suggestions:</p>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-gray-800">
                      &#34;Streamlined operational workflows, reducing processing time by 25% while maintaining 98% customer satisfaction rate&#34;
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-gray-800">
                      &#34;Led cross-functional team of 8 members across 5 departments, delivering 3 high-impact projects ahead of schedule&#34;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features for 
              <span className="text-purple-600 block">Resume Enhancement</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Content Generation</h3>
              <p className="text-gray-600 mb-4">
                Our AI analyzes your experience and generates compelling content that highlights your achievements with quantifiable results.
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center">
                Learn More <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry Optimization</h3>
              <p className="text-gray-600 mb-4">
                Tailored suggestions based on your specific industry, incorporating relevant keywords and terminology that resonate with recruiters.
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center">
                Learn More <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ATS Compatibility</h3>
              <p className="text-gray-600 mb-4">
                Every suggestion is optimized to pass Applicant Tracking Systems while maintaining readability and professional appeal.
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center">
                Learn More <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-12 rounded-2xl">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-center">
              <p className="text-2xl font-semibold text-gray-900 mb-8">
                &#34;Hireable AI&#39;s editor transformed my resume from generic to exceptional. 
                The AI suggestions helped me articulate my achievements in ways I never 
                could have on my own. Highly recommend for anyone serious about their career.&#34;
              </p>
              <footer>
                <div className="font-semibold text-gray-900 mb-1">Jennifer Martinez</div>
                <div className="text-gray-600">Senior Product Manager</div>
                <div className="mt-4 text-gray-500">Featured in Business Insider</div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start with 5,000 free AI credits. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Credits</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                $10
                <span className="text-lg font-normal text-gray-600">/50,000 credits</span>
              </div>
              <p className="text-gray-600 mb-6">
                Perfect for job seekers who need to enhance their resume occasionally.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">~250 bullet point enhancements</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Never expires</span>
                </li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Get Started
              </button>
            </div>

            <div className="bg-purple-600 p-8 rounded-lg shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-2">Unlimited Monthly</h3>
              <div className="text-4xl font-bold mb-4">
                $29
                <span className="text-lg font-normal opacity-90">/month</span>
              </div>
              <p className="opacity-90 mb-6">
                Best for active job seekers and career professionals.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Unlimited AI enhancements</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>All premium features included</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              All plans include: Export to PDF/Word • Real-time preview • 
              Grammar checking • ATS optimization
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How does the AI editor improve my resume?
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your content and suggests improvements based on best practices, 
                industry standards, and successful resume patterns. It helps quantify achievements, 
                use action verbs, and optimize for ATS systems.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade encryption and never share your personal 
                information. Your resume data is only used to provide you with suggestions 
                and is deleted from our servers after processing.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What are AI credits?
              </h3>
              <p className="text-gray-600">
                AI credits are used each time you generate enhanced content. One enhancement 
                typically uses 200-400 credits. With 50,000 credits, you can enhance 
                approximately 150-250 bullet points.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I use this for multiple resumes?
              </h3>
              <p className="text-gray-600">
                Yes! You can edit and enhance as many resumes as you like. This is especially 
                useful for tailoring your resume to different job applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Resume?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of professionals who&#39;ve enhanced their careers with Hireable AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Editing Free
            </button>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-purple-600 transition-colors">
              Watch Demo
            </button>
          </div>
          <p className="mt-6 text-purple-200">
            No credit card required • 5,000 free credits included
          </p>
        </div>
      </section>
    </div>
  );
}
