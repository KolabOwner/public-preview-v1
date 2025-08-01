'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Target, Zap, CheckCircle, Star, TrendingUp } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';
import CtaSection from '@/components/marketing/CtaSection';

export default function AIKeywordTargetingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <section className="bg-gray-50 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
                AI Keyword Targeting
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Updated on</span>
                <span>August 1, 2025</span>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-amber-600 mb-4">AI Keyword Targeting</h3>
                <div className="space-y-2">
                  <a href="#target-your-resume" className="block text-amber-600 hover:underline">Target your resume</a>
                  <a href="#what-is-ai-keyword-targeting" className="block text-gray-600 hover:text-amber-600">What is AI Keyword Targeting?</a>
                  <a href="#2-ways-to-start-targeting" className="block text-gray-600 hover:text-amber-600">2 Ways to start targeting</a>
                  <a href="#how-to-add-optimized-keywords" className="block text-gray-600 hover:text-amber-600">How to add optimized keywords</a>
                </div>
              </div>
            </div>

            {/* Contributor Info */}
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-amber-600 mb-4">Contributor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Rezum Team</div>
                    <div className="text-sm text-amber-600">August 1, 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar - CTA Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  {/* CTA Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Land the interview</h3>
                        <p className="text-sm text-gray-600">Target your resume to fit any position with AI.</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-600 fill-current" />
                        <span className="text-amber-600 font-semibold text-sm">5/5 rating</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Target your resume to fit any position with AI keyword optimization.
                      </p>
                    </div>

                    <Link
                      href="/sign-up"
                      className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-semibold text-center block hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Scan Resume</span>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Article Content */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none">
                
                {/* Video Placeholder */}
                <div className="mb-8">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white ml-1"></div>
                      </div>
                      <p className="text-gray-600">AI Keyword Targeting Video Tutorial</p>
                    </div>
                  </div>
                </div>

                <div className="text-gray-700 space-y-6">
                  <h2 id="target-your-resume" className="text-3xl font-bold text-gray-900 mb-6">Target your resume</h2>
                  
                  <p>
                    In today's job market, landing an interview demands more than a one-size-fits-all resume. Applicant Tracking Systems (ATS) scan resumes for specific keywords matching the job requirements. So, yes, customizing your resume for each role is crucial. No worries, though—we've got you covered.
                  </p>

                  <p>
                    Rezum's AI Keyword Targeting is designed to boost your ATS success (and <strong>Rezum Score</strong>). Our tool suggests relevant keywords to include in your resume, making it ATS-friendly and increasing your chances of getting noticed. Below, we explain everything you need to know to make targeting your resume a breeze.
                  </p>

                  {/* CTA Block */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 my-8 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 mb-2">
                          <span className="font-semibold">Land the interview</span> - Target your resume to fit any position with AI.
                        </p>
                        <div className="flex items-center gap-2 text-amber-600">
                          <span className="font-semibold">Scan Resume</span>
                          <ChevronLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 id="what-is-ai-keyword-targeting" className="text-3xl font-bold text-gray-900 mb-6">What is AI Keyword Targeting?</h2>

                  <p>
                    AI Keyword Targeting is the ultimate solution for getting your resume noticed by any ATS and landing it in the hands of your next employer. Harnessing the power of AI, we meticulously scan your resume against the specific job profile, evaluating your keyword match and ranking.
                  </p>

                  <p>
                    Our innovative tool then offers a list of suggested keywords to incorporate, boosting your chances of standing out and securing that dream job. With AI Keyword Targeting on your side, you're set to conquer the job market and make a lasting impression on potential employers.
                  </p>

                  <h2 id="2-ways-to-start-targeting" className="text-3xl font-bold text-gray-900 mb-6">2 Ways to start targeting</h2>

                  <p>Ready to target your resume for that dream job? Let's get started in two simple ways: creating a new resume or finishing up an existing one.</p>

                  <p>No matter which path you choose, you'll need three key details:</p>

                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li><strong>Job Title</strong></li>
                    <li><strong>Job Description</strong></li>
                    <li><strong>Company Name</strong></li>
                  </ol>

                  <p>Simply copy and paste this information from the job listing you're applying for. We'll take care of the rest.</p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Create a resume</h3>

                  <p>When crafting a new resume, you can optimize it for a particular role with AI Keyword Targeting. Just activate and complete the <strong>Target your resume</strong> section.</p>

                  <div className="bg-gray-50 border-l-4 border-amber-500 p-4 my-6">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>To create a resume, navigate to your Rezum dashboard.</li>
                      <li>Click the "Create New Resume" button in the top left corner.</li>
                      <li>Complete the form provided, filling out the Resume Name, Field or Domain, and Experience.</li>
                      <li>Then toggle the "Target your resume" button to activate.</li>
                      <li>From there, fill out the Job Title, Company Name, and Job Description.</li>
                      <li>Press the "Save" button to complete.</li>
                    </ol>
                  </div>

                  {/* Video Placeholder */}
                  <div className="my-8">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white ml-1"></div>
                        </div>
                        <p className="text-gray-600">AI Keyword Targeting on Creation</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Finish up tab</h3>

                  <p>Perfecting your resume or giving it a refresh? Head to the Finish Up tab and enable <strong>AI Keyword Targeting</strong> for that extra boost!</p>

                  <div className="bg-gray-50 border-l-4 border-amber-500 p-4 my-6">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>To access AI Keyword Targeting, navigate to the "Finish Up" tab.</li>
                      <li>On the right side of your screen, fill out the Job Title and Job Description.</li>
                      <li>Click the "Save Job Description" button and discover optimized keywords.</li>
                    </ol>
                  </div>

                  {/* Video Placeholder */}
                  <div className="my-8">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white ml-1"></div>
                        </div>
                        <p className="text-gray-600">AI Keyword Targeting on Finish up</p>
                      </div>
                    </div>
                  </div>

                  <h2 id="how-to-add-optimized-keywords" className="text-3xl font-bold text-gray-900 mb-6">How to add optimized keywords</h2>

                  <p>
                    You've successfully utilized AI Keyword Targeting and discovered some additional keyword suggestions. Now, you might wonder what to do next. While stuffing your resume with keywords may appease the ATS, it won't impress your future employer.
                  </p>

                  <p>
                    So, how can you seamlessly include resume keywords? Here are a few tips to consider, ensuring your resume shines naturally and impresses both ATS and the hiring manager.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Skills</h3>

                  <p>
                    When you find yourself uncertain, don't forget that your skills section serves as the ideal place to incorporate those optimized keywords. It's a foolproof strategy, especially when the rest of your resume is mostly on point and you want to tailor it effortlessly for various job applications.
                  </p>

                  <p>
                    Be adventurous with words and consider using synonyms for specific skills, as some job postings may vary in terminology. This simple yet effective approach is a game-changer for fine-tuning your resume to match any job description and boost your chances of landing that interview.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Bullet points</h3>

                  <p>
                    When tailoring your resume for different roles, it's essential to give your bullet points a refreshing twist with relevant keywords. Depending on the job, certain positions might emphasize specific software skills or workplace accomplishments.
                  </p>

                  <p>
                    As you delve into the details of your career, you may discover perfect opportunities to seamlessly incorporate keywords where they naturally fit. Embrace this chance to optimize your bullet points and make your resume a compelling match for any job application.
                  </p>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-6 my-12">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">AI-Powered Analysis</h4>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Our AI scans job descriptions and suggests the most relevant keywords to include in your resume for maximum ATS compatibility.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">ATS Optimization</h4>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Ensure your resume passes through Applicant Tracking Systems and reaches human recruiters with targeted keyword optimization.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Job-Specific Targeting</h4>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Customize your resume for each specific job application with keywords that match the exact requirements.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Higher Interview Rate</h4>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Increase your chances of landing interviews by up to 3x with properly optimized resume keywords.
                      </p>
                    </div>
                  </div>

                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <CtaSection
        title="Ready to Optimize Your Resume with <span class='bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>AI Keyword Targeting?</span>"
        subtitle="Join thousands of job seekers who have increased their interview rate with our AI-powered keyword optimization."
        ctaText="Start Targeting Now"
        ctaUrl="/sign-up"
      />

      <Footer />
    </div>
  );
}