'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';
import CtaSection from '@/components/marketing/CtaSection';
import DashboardMockup from '@/components/marketing/DashboardMockup';

export default function CoverLettersPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('Programming');

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const categories = [
    'Programming', 'Marketing', 'Engineering', 'Business', 'Finance', 'Student', 'Design', 'Legal', 'Medical'
  ];

  const coverLetterTemplates = {
    Programming: [
      { title: 'Web Designer Cover Letter', image: '/images/templates/StandardTemplate.png' },
      { title: 'System Administrator Cover Letter', image: '/images/templates/ModernTemplate.png' },
      { title: 'Software Engineer Cover Letter', image: '/images/templates/CompactTemplate.png' },
      { title: 'Software Developer Cover Letter', image: '/images/templates/BoldTemplate.png' },
      { title: 'Software Architect Cover Letter', image: '/images/templates/AlternativeTemplate.png' },
      { title: 'Senior Security Consultant Cover Letter', image: '/images/templates/StandardTemplate.png' }
    ],
    Marketing: [
      { title: 'Social Media Manager Cover Letter', image: '/images/templates/ModernTemplate.png' },
      { title: 'Sales Cover Letter', image: '/images/templates/CompactTemplate.png' },
      { title: 'Product Marketing Manager Cover Letter', image: '/images/templates/BoldTemplate.png' },
      { title: 'Marketing Manager Cover Letter', image: '/images/templates/AlternativeTemplate.png' },
      { title: 'Marketing Assistant Cover Letter', image: '/images/templates/StandardTemplate.png' },
      { title: 'Marketing Insights Cover Letter', image: '/images/templates/ModernTemplate.png' }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <section className="bg-gray-50 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              180+ Cover Letter Templates for All Jobs
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Supercharge your job search with Rezum templates. <br />
              Need more help? Use Rezum&apos;s AI Cover Letter Builder to instantly generate tailored cover letters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors"
              >
                Create your cover letter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Navigation */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeCategory === category
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {activeCategory} Cover Letter Templates
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(coverLetterTemplates[activeCategory as keyof typeof coverLetterTemplates] || coverLetterTemplates.Programming).map((template, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src={template.image}
                        alt={template.title}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                    </div>
                    <Link
                      href="/sign-up"
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Cover Letters Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  Better results with less effort
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tailored Cover Letters - No Writing Required.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The created cover letter will reference your resume experiences in how they tie to the specific job post.
              </p>
              <div>
                <Link
                  href="/sign-up"
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your cover letter now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                {/* Main Preview Image */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/preview.svg"
                    alt="Cover Letter Preview"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
                {/* Skeleton State Overlay */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={200}
                    height={150}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed Up Applications Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  See the difference in your interview rate
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Speed Up Attractive Job Applications
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The cover letter will generate in just a few seconds. You can edit after if you need.
              </p>
              <div>
                <Link
                  href="/sign-up"
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your cover letter now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                {/* Menu Image - Top Left */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/templates/menu.svg"
                    alt="Customization Menu"
                    width={150}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
                {/* Skeleton State - Main Background */}
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
                {/* Text Action Menu - Bottom Right */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/templates/text-action-menu.svg"
                    alt="Text Action Menu"
                    width={150}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Post Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* Left Content - Template Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform scale-90 origin-top">
                  {/* Template Image */}
                  <div className="aspect-[3/4] overflow-hidden border-b border-gray-200">
                    <Image
                      src="/images/templates/smart-template.png"
                      alt="Smart Cover Letter Template"
                      width={400}
                      height={533}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Template Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Start making your cover letter</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        &quot;Since the time I found Rezum, it has been relatively stress free to create multiple cover letters as per the job description.&quot;
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed mt-2">
                        <strong>petuniawhoya</strong> - Reddit
                      </p>
                    </div>

                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">5/5 rating</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/sign-up"
                      className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold text-center block hover:bg-gray-300 transition-colors"
                    >
                      Create your free account now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Article */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none">
                <div className="text-gray-600 space-y-6">
                  <p className="font-semibold text-gray-900">
                    Most job applications give you the opportunity to send a cover letter alongside your resume.
                  </p>

                  <p>
                    Good cover letters take a considerable amount of time, thought, and effort to write. All of which could be greatly minimized with one feature. Rather than writing one yourself from scratch, it can now be written itself by using some key information.
                  </p>

                  <p>
                    In this tutorial, you&apos;ll learn how to build a tailored cover letter using our AI cover letter generator.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    What You Need to Complete this Tutorial
                  </h2>

                  <p>Here are the prerequisites for completing this tutorial:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>A Rezum account</li>
                    <li>The job description</li>
                    <li>AI writer credits</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    A Rezum Account
                  </h3>

                  <p>
                    You&apos;ll need to have an account on Rezum to access the <Link href="/sign-up" className="text-amber-600 hover:underline font-semibold">AI cover letter generator</Link>.
                  </p>

                  <p>
                    It&apos;s free. No card details are required – all you need to do is enter your email and create a password.
                  </p>

                  <p>
                    <Link href="/sign-up" className="text-amber-600 hover:underline font-semibold">Get started now.</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    The Job Description
                  </h3>

                  <p>The minimum information required from the job description is the following:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Company name</li>
                    <li>Job position/title</li>
                  </ul>

                  <p>
                    This is used to ensure your application is tailored by mentioning the relevant skills and responsibilities.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    AI Writer Credits
                  </h3>

                  <p>
                    AI writer credits are used each time you generate a cover letter. When you sign up on Rezum for free, your account is given a limited amount of credits. If you&apos;ve run out but would like to continue using the feature, you can upgrade your plan at any time.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    Method 1: Creating a Cover Letter for an Existing Resume
                  </h2>

                  <p>Follow this method to build a cover letter for one of your existing resumes with Rezum.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    1. Go to the Rezum Dashboard
                  </h3>

                  <p>Log in to your account to access the Rezum dashboard.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2. Select an Existing Resume
                  </h3>

                  <p>
                    Select an existing resume from your dashboard that you want to build a cover letter for.
                  </p>

                  <p>
                    If you don&apos;t have one, you&apos;ll need to create a new CV and complete your resume before moving on to the next step.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3. Go to the &apos;AI Cover Letter&apos; Tab
                  </h3>

                  <p>
                    After selecting an existing resume or completing your resume with Rezum, head over to the &apos;AI cover letter&apos; tab.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4. Complete the Form Provided on the Right Side of the Page
                  </h3>

                  <p>On the right side of the page, you&apos;ll find a form requiring the following information:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Company name:</strong> The name of the company you&apos;re applying for.</li>
                    <li><strong>Position/title:</strong> The job position/title you&apos;re applying for.</li>
                    <li><strong>Position highlight:</strong> A job position from your work history you&apos;d like to highlight.</li>
                    <li><strong>Education highlight:</strong> An academic qualification you&apos;d like to highlight (we only recommend this for students and recent graduates).</li>
                    <li><strong>Skills highlight:</strong> These are the skills you want to emphasize in your cover letter.</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5. Click the &apos;AI Writer Ready&apos; Button
                  </h3>

                  <p>
                    After completing the form, click on the &apos;AI Writer Ready&apos; button and wait for the results.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6. Generate a New Version or Save the Suggestion
                  </h3>

                  <p>
                    If you&apos;d like to generate a new version of the cover letter, press the &quot;AI Writer Generate&quot; button again.
                  </p>

                  <p>
                    But if you like the cover letter that&apos;s been produced, press the &quot;save suggestion&quot; button.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    Method 2: Creating a Cover Letter From Scratch
                  </h2>

                  <p>Follow this method to build a cover letter by itself without using an existing resume with Rezum.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    1. Go to the Rezum Dashboard
                  </h3>

                  <p>Log in to your account to access the Rezum dashboard.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2. Head Over to the Cover Letters Tab
                  </h3>

                  <p>Click on the &apos;cover letters&apos; tab.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3. Select &apos;Create New Cover Letter&apos;
                  </h3>

                  <p>Select the &apos;create new cover letter&apos; button shown on the page.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4. Enter Your Full Name
                  </h3>

                  <p>Enter your name and press the &apos;save&apos; button.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5. Complete the Contact Information Section
                  </h3>

                  <p>Fill out the bars with your contact details. Once this has been completed, press the &apos;save basic info&apos; button.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6. Head Over to the &apos;Finish up&apos; Tab
                  </h3>

                  <p>Go to the finish up tab as shown below.</p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    7. Complete the Form Provided on the Right Side of the Page
                  </h3>

                  <p>On the right side of the page, you&apos;ll find a form requiring the following information:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Company name:</strong> The name of the company you&apos;re applying for.</li>
                    <li><strong>Position/title:</strong> The job position/title you&apos;re applying for.</li>
                    <li><strong>Position highlight:</strong> A job position from your work history you&apos;d like to highlight.</li>
                    <li><strong>Education highlight:</strong> An academic qualification you&apos;d like to highlight (we only recommend this for students and recent graduates).</li>
                    <li><strong>Skills highlight:</strong> These are the skills you want to emphasize in your cover letter.</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    8. Click the &apos;AI Writer Ready&apos; Button
                  </h3>

                  <p>
                    After completing the form, click on the &apos;AI Writer Ready&apos; button and wait for the results.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    9. Generate a New Version or Save the Suggestion
                  </h3>

                  <p>
                    If you&apos;d like to generate a new version of the cover letter, press the &quot;AI Writer Generate&quot; button again.
                  </p>

                  <p>
                    But if you like the cover letter that&apos;s been produced, press the &quot;save suggestion&quot; button.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    What Are the Best Things to Highlight On Your Cover Letter?
                  </h2>

                  <p>
                    The best things to highlight on your cover letter are your most relevant strengths to the job duties and responsibilities. These should imply to your hiring managers that you&apos;re a good fit for the role.
                  </p>

                  <p>Here are a few examples of things to highlight:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Accomplishments</li>
                    <li>Education</li>
                    <li>Skills</li>
                    <li>Work experience</li>
                  </ul>

                  <p>
                    If you&apos;re a student or graduate, then it&apos;s worth focusing on your academic background since you likely won&apos;t have much work experience. On the other hand, those with more than 2 years of experience could focus on their employment background and workplace achievements.
                  </p>

                  <p>
                    The only rule is to not repeat what you&apos;ve already mentioned in your resume. Unless you&apos;re adding in new information, don&apos;t write about the same things over and over.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    Which AI-Generated Cover Letter Version Is the Best?
                  </h2>

                  <p>
                    It depends – which one do you find most suited to your needs?
                  </p>

                  <p>
                    This comes down to your professional judgment in deciding whether or not the cover letter best represents your ability and character as a worker. Look at the job description and think about your own skill set.
                  </p>

                  <p>
                    If you&apos;re not satisfied with the results, you can keep using the feature until it generates something you&apos;re happy with.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    How Many Times Can You Use the AI Cover Letter Generator?
                  </h2>

                  <p>
                    As long as you have enough AI writer credits, you can use the feature as many times as you&apos;d like. Just remember that once you press the AI writer generate button, the previous draft won&apos;t be saved.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    Using An AI Cover Letter Generator VS Writing From Scratch
                  </h2>

                  <p>
                    Let&apos;s briefly look at the benefits you stand to gain from using the AI writer compared to writing from scratch.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-green-900 mb-4">Using an AI writer:</h3>
                      <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
                        <li>Skip the outline and drafting process by getting straight into editing</li>
                        <li>No more constant back and forth research or page hopping</li>
                        <li>Make the writing part easy by getting instant inspiration</li>
                        <li>Save time and get more applications sent with minimal effort</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-blue-900 mb-4">Writing from scratch:</h3>
                      <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                        <li>Start with an outline or draft before editing and refining your application</li>
                        <li>Constantly refer to the job description page to ensure it&apos;s tailored</li>
                        <li>Search up multiple cover letter examples online to draw inspiration from other candidates</li>
                        <li>Generally takes more time and effort, which can be draining and result in fewer applications sent</li>
                      </ul>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    The Advantages of Sending a Good Cover Letter
                  </h2>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    It Shows Your Enthusiasm
                  </h3>

                  <p>
                    Cover letters aren&apos;t usually essential. But your employers will see the effort you&apos;re putting into your job application. This can indicate your passion and work ethic, which are differentiating factors that set you apart from other applicants.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    You Get to Explain Why You&apos;re a Good Fit
                  </h3>

                  <p>
                    Resumes give the company an overview of your professional background. It&apos;s like a report summarizing your career history and highlights.
                  </p>

                  <p>
                    Whereas, a cover letter gives you the chance to explain yourself as a professional. In other words, it allows you to talk more about why you&apos;re the right person for the role. This extra room for information could be used to your advantage.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Let Employers See Your Personality
                  </h3>

                  <p>
                    Another aspect recruiters look at is if a candidate is a good cultural fit for the organization. This means aligning with the company&apos;s mission and values. Those who are a good cultural fit are likely to adapt better to the work environment and be more productive.
                  </p>

                  <p>
                    It&apos;s harder for employers to get insight into your personality in a resume compared to cover letters. But, keep it professional otherwise you&apos;re making a common writing mistake.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    Structuring Your Cover Letter
                  </h2>

                  <p>Here&apos;s the general structure of a cover letter:</p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Header</li>
                    <li>Opening paragraph</li>
                    <li>Main body</li>
                    <li>Closing paragraph</li>
                    <li>Signoff</li>
                  </ul>

                  <p>
                    All cover letters should be no further than one-page long. Half a page is also more than enough.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    What About Letters of Interest?
                  </h2>

                  <p>
                    Letters of interest are similar to cover letters.
                  </p>

                  <p>
                    The difference is that they&apos;re usually for job positions that aren&apos;t being advertised. So, you&apos;re letting the company know you&apos;re keen to work in a specific role for them if there&apos;s an opportunity for it.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-6 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      The Best Practices for Using the AI Cover Letter Generator
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Editing and Proofreading</h4>
                        <p className="text-sm">
                          Using the cover letters that have been generated, see which ones you like the most and edit accordingly to suit your needs. It&apos;s good practice to edit and proofread what&apos;s been written to customize the job application as your own.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Personalize It</h4>
                        <p className="text-sm">
                          Your cover letter isn&apos;t generated randomly. It uses the information from what you&apos;ve mentioned in your resume and the short form you filled out. Aside from solely relying on this, think about the expectations of your employers.
                        </p>
                        <p className="text-sm mt-2">
                          Ask yourself, how are you the best person for the job? What do they want to see from you? There may be subtle details that could be included for further personalization.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Save It</h4>
                        <p className="text-sm">
                          It&apos;s worth saving each draft the AI cover letter feature generates. Although you might not be entirely satisfied with what&apos;s been written, use them as references for certain sections in your application. Or even use them as inspiration for the future cover letters you work on.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Support</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about using Rezum&apos;s cover letter templates
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is it OK to use a template for a cover letter?",
                answer: (
                  <>
                    Yes, using a template for a cover letter is perfectly fine. In fact, many job seekers use templates to help them structure their cover letters and ensure that they include all of the necessary information. A cover letter template can provide a helpful starting point and help you organize your thoughts. However, be sure to <Link href="/sign-up" className="text-amber-600 hover:underline font-semibold">customize the template</Link> to fit your own circumstances and the specific job for which you are applying. This will help your cover letter stand out and show the employer that you are a good fit for the position.
                  </>
                )
              },
              {
                question: "How do you write a good cover letter?",
                answer: "A good cover letter should be tailored to the specific job for which you are applying and highlight your relevant qualifications. It should be concise, well-written, and free of errors. Start with a strong opening explaining why you are writing and mention the specific job. Provide evidence of your qualifications with specific examples. Show enthusiasm and interest in the company. End with a strong closing that summarizes your qualifications and reiterates your interest in the job."
              },
              {
                question: "What are the 7 parts of a cover letter?",
                answer: "The 7 parts of a cover letter are: 1. The heading - which includes your contact information, 2. The date, 3. The recipient's contact information - an email is sufficient, 4. A salutation or greeting - such as \"Dear [Employer]\", 5. The body of the letter - which should include several paragraphs discussing your relevant qualifications and experiences, 6. A closing - such as \"Sincerely\" or \"Best regards\", 7. Your signature - followed by your typed name."
              },
              {
                question: "Do I really need a cover letter for a job in 2024?",
                answer: "Yes, you should include a cover letter with your job application in 2024. A cover letter is a valuable tool that can help you stand out from other applicants and make a strong case for why you are the best candidate for the job. In addition to providing an overview of your qualifications, a cover letter allows you to show your personality and enthusiasm for the position and the company. This can help the employer get a better sense of who you are and why you would be a good fit for the job."
              },
              {
                question: "Do many job seekers use cover letter examples in their job search?",
                answer: "Yes, many job seekers use cover letter examples in their job search. Cover letter examples can provide a helpful starting point and structure for writing your own cover letter. They can help you understand what to include and how to format your letter, and they can also give you ideas for what to say. However, it's important to customize the example to fit your own circumstances and the specific job for which you are applying."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                  <div className={`transition-transform duration-200 ${openFAQ === index ? 'rotate-45' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.3333 15.667V16.3336C25.3333 16.7018 25.0349 17.0003 24.6667 17.0003H17V24.667C17 25.0351 16.7015 25.3336 16.3333 25.3336H15.6667C15.2985 25.3336 15 25.0351 15 24.667V17.0003H7.3333C6.96511 17.0003 6.66663 16.7018 6.66663 16.3336V15.667C6.66663 15.2988 6.96511 15.0003 7.3333 15.0003H15V7.33365C15 6.96546 15.2985 6.66699 15.6667 6.66699H16.3333C16.7015 6.66699 17 6.96546 17 7.33365V15.0003H24.6667C25.0349 15.0003 25.3333 15.2988 25.3333 15.667Z" fill="currentColor"/>
                    </svg>
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Ready to Create Your Professional <span class='bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>Cover Letter?</span>"
        subtitle="Join thousands of job seekers who have landed their dream jobs with Rezum cover letter templates."
        ctaText="Get Started Free"
        ctaUrl="/sign-up"
      />

      <DashboardMockup />

      <Footer />
    </div>
  );
}