'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Footer from '@/components/marketing/Footer';
import CtaSection from '@/components/marketing/CtaSection';
import DashboardMockup from '@/components/marketing/DashboardMockup';

export default function ResumeExamplesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const resumeExamples = {
    popular: [
      { title: 'Account Executive', href: '#' },
      { title: 'Startup Founder', href: '#' },
      { title: 'Software Engineer Intern', href: '#' },
      { title: 'Data Science - Entry Level', href: '#' }
    ],
    programming: [
      { title: 'API Developer', href: '#' },
      { title: 'Android Developer', href: '#' },
      { title: 'App Developer', href: '#' },
      { title: 'Associate Software Developer', href: '#' }
    ],
    marketing: [
      { title: 'Agile Marketing Project Manager', href: '#' },
      { title: 'Assistant Brand Manager', href: '#' },
      { title: 'Assistant Editor', href: '#' },
      { title: 'Brand Consultant', href: '#' }
    ],
    engineering: [
      { title: 'Aerospace Engineer', href: '#' },
      { title: 'Aerospace Engineer Intern', href: '#' },
      { title: 'Aerospace Research Assistant', href: '#' },
      { title: 'Automation Engineer', href: '#' }
    ],
    business: [
      { title: 'Business Analyst', href: '#' },
      { title: 'Business Development Manager', href: '#' },
      { title: 'Business Operations Manager', href: '#' },
      { title: 'Consultant', href: '#' }
    ],
    finance: [
      { title: 'Financial Analyst', href: '#' },
      { title: 'Investment Banking Analyst', href: '#' },
      { title: 'Corporate Finance Manager', href: '#' },
      { title: 'Risk Management Specialist', href: '#' }
    ],
    student: [
      { title: 'College Student', href: '#' },
      { title: 'Graduate Student', href: '#' },
      { title: 'Internship Applicant', href: '#' },
      { title: 'Recent Graduate', href: '#' }
    ],
    design: [
      { title: 'Graphic Designer', href: '#' },
      { title: 'UX/UI Designer', href: '#' },
      { title: 'Product Designer', href: '#' },
      { title: 'Creative Director', href: '#' }
    ],
    legal: [
      { title: 'Corporate Lawyer', href: '#' },
      { title: 'Legal Assistant', href: '#' },
      { title: 'Paralegal', href: '#' },
      { title: 'Contract Specialist', href: '#' }
    ],
    medical: [
      { title: 'Registered Nurse', href: '#' },
      { title: 'Medical Assistant', href: '#' },
      { title: 'Healthcare Administrator', href: '#' },
      { title: 'Physical Therapist', href: '#' }
    ]
  };

  const additionalExamples = {
    programming: [
      'Back-End Developer', 'C# Developer', 'C# Software Engineer', 'C++ Developer',
      'Embedded Software Developer', 'Entry-Level Web Developer', 'Freelance Front-End Developer',
      'Front End Developer', 'Front end Application Developer', 'Front-End Engineer',
      'Full Stack Developer', 'Full Stack Developer Intern', 'Full Stack Software Engineer',
      'Game Developer', 'Game Programmer', 'Game Programmer Intern', 'Graphics Programmer',
      'Integration Developer', 'Java Developer', 'JavaScript Developer', 'Jr Software Engineer',
      'Junior Backend Software Engineer', 'Junior Software Engineer', 'Lead Software Engineer',
      'Mobile App Developer', 'Python Developer', 'Python Software Engineer', 'React Developer',
      'React Software Engineer', 'Remote Full Stack Software Engineer', 'Ruby on Rails Developer',
      'SAP Developer', 'Salesforce Developer - Operations', 'Salesforce Developer',
      'Senior Full Stack Developer', 'Senior SAP Developer', 'Senior Solutions Engineer',
      'Senior Web Developer', 'Software Architect', 'Software Developer', 'Software Developer Intern',
      'Software Development Intern', 'Software Engineer (Product)', 'Software Engineering Manager',
      'UI Developer', 'VR Developer', 'Web Application Developer', 'Web Developer', 'iOS Developer'
    ],
    marketing: [
      'Brand Director', 'Brand Manager', 'Brand Specialist', 'Chief Communications Officer (CCO)',
      'Chief Marketing Officer', 'Communications Coordinator', 'Communications Executive',
      'Communications Manager', 'Communications Specialist', 'Content Manager', 'Content Marketing Lead',
      'Content Specialist', 'Content Strategist', 'Content Writer', 'Copy Writer', 'Copywriter',
      'Customer Insights Manager', 'Digital Marketing Analyst', 'Digital Marketing Consultant',
      'Digital Marketing Coordinator', 'Digital Marketing Director', 'Digital Marketing Executive',
      'Digital Marketing Manager', 'Digital Marketing', 'Digital Marketing Specialist',
      'Digital Media Supervisor', 'Digital and Content Lead', 'Director of Content Marketing',
      'Director of Marketing and Comms', 'Director of Public Affairs', 'Editor', 'Editorial Director',
      'Editorial Manager', 'Email Marketing Coordinator', 'Email Marketing Manager',
      'Email Marketing Specialist', 'Event Assistant', 'Event Marketing Manager',
      'General Marketing Analyst', 'Growth Marketing Manager', 'Head of Content', 'Head of Growth',
      'Intelligence Analyst', 'International Marketing Manager', 'Market Research Associate',
      'Market Research Manager', 'Marketing Analyst', 'Marketing Analytics Manager',
      'Marketing Assistant', 'Marketing Consultant', 'Marketing Data Scientist', 'Marketing Insights',
      'Marketing Lead', 'Marketing Manager', 'PPC Executive', 'PPC Specialist', 'PR (Public Relations) Manager',
      'PR Coordinator', 'Paid Media Manager', 'Product Development', 'Product Marketing Manager',
      'Public Relations (PR) Director', 'Public Relations (PR) Specialist', 'SEM Specialist',
      'SEO Analyst', 'SEO Manager', 'SEO Specialist', 'Senior Content Marketing Manager',
      'Senior Marketing Manager', 'Social Media', 'Social Media Analyst', 'Social Media Community Manager',
      'Social Media Coordinator', 'Social Media Director', 'Social Media Manager', 'Social Media Specialist'
    ],
    engineering: [
      'Automotive Engineer', 'Avionics Engineer', 'Biomedical Engineer', 'Biomedical Engineer Intern',
      'Ceramic Engineer', 'Chemical Engineer', 'Chief Mechanical Engineer', 'Civil Engineer',
      'Clinical Engineer', 'Co-Op Mechanical Engineer', 'Computer Engineer', 'Computer Engineering Student',
      'Construction Engineer', 'Controls Engineer', 'DSP Engineer', 'DevOps Engineer',
      'Director, Systems Engineering', 'Drilling Engineer', 'Electrical Engineer', 'Electronics Engineer',
      'Engineer', 'Entry Level Mechanical Engineer', 'Environmental Engineer', 'Experienced Mechanical Engineer',
      'Facilities Engineer', 'Flight Test Engineer', 'Geotechnical Engineer', 'HVAC Engineer',
      'Hardware Engineer', 'Hardware engineering Intern', 'Hydrogeologist', 'Industrial Engineer',
      'Junior Electrical Engineer', 'Lead Civil Engineer', 'Manufacturing Engineer', 'Materials Engineer',
      'Mechanical CAD Designer', 'Mechanical Design Engineer', 'Mechanical Design Engineer Intern',
      'Mechanical Engineer', 'Mechanical Engineer Intern', 'Metallurgical Engineer', 'Nuclear Engineer',
      'Operations Engineer', 'Petrochemical Engineer', 'Petroleum Engineer', 'Polymer Engineer',
      'Power Engineer', 'Process Engineer', 'Process Technician', 'Production Engineer',
      'Quality Engineer', 'Rehabilitation Engineer', 'Research and Development Engineer',
      'Reservoir Engineer', 'Robotics Engineer', 'Senior Aircraft Mechanical Design Engineer',
      'Senior Engineering Manager', 'Senior Mechanical Engineer', 'Senior Quality Engineer',
      'Senior Robotics Engineer', 'Senior Software Engineer', 'Senior Systems Engineer',
      'Service Technician', 'Software Engineer', 'Software Engineer Intern', 'Spacecraft Mechanical Engineer',
      'Structural Engineer', 'Subsea Engineer', 'Systems Engineer Intern', 'Transportation Engineer',
      'Water Resources Engineer'
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-900 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              300+ Resume Examples for All Jobs
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Discover the best kinds of sections, keywords, and qualifications to put on a resume for 300+ positions.<br />
              Our resume examples will show you the skills and achievements you need to land work in 2024
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sign-up" 
                className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors"
              >
                Create your resume now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <section className="sticky top-16 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {['Popular', 'Programming', 'Marketing', 'Engineering', 'Business', 'Finance', 'Student', 'Design', 'Legal', 'Medical'].map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase()}`}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-amber-500 hover:text-white transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <section id="popular" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Popular Resume Examples</h2>
            <p className="text-lg text-gray-600">These are Rezum&apos;s most visited resume examples according to Google Analytics.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.popular.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Programming Section */}
      <section id="programming" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dev & Programming Resumes</h2>
            <p className="text-lg text-gray-600">Dev and programming construct the digital world. They build websites, apps, and software by writing code that instructs computers. Our dev and programming resume examples will help set you apart from other candidates.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {resumeExamples.programming.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalExamples.programming.map((title, index) => (
              <Link key={index} href="/sign-up" className="text-amber-600 hover:underline font-medium text-sm">
                {title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Section */}
      <section id="marketing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Marketing Resumes</h2>
            <p className="text-lg text-gray-600">Marketing builds bridges between businesses and customers. They craft strategies and campaigns to promote products and services, driving awareness and sales. Our range of marketing resume examples will give you the ideal starting point to progress in your marketing career.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {resumeExamples.marketing.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalExamples.marketing.map((title, index) => (
              <Link key={index} href="/sign-up" className="text-amber-600 hover:underline font-medium text-sm">
                {title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Section */}
      <section id="engineering" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Engineering Resumes</h2>
            <p className="text-lg text-gray-600">Engineering builds the world around us. This is where you apply scientific principles to design, develop, and maintain structures, machines, and systems. Use one of our engineering resume examples to secure your next job interview.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {resumeExamples.engineering.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalExamples.engineering.map((title, index) => (
              <Link key={index} href="/sign-up" className="text-amber-600 hover:underline font-medium text-sm">
                {title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Resumes</h2>
            <p className="text-lg text-gray-600">Business professionals drive organizational success through strategic planning, analysis, and leadership. Our business resume examples showcase the skills and achievements that make candidates stand out in competitive corporate environments.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.business.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Section */}
      <section id="finance" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Finance Resumes</h2>
            <p className="text-lg text-gray-600">Finance professionals manage money, investments, and financial strategies that drive business growth. Our finance resume examples demonstrate the analytical skills and achievements that employers value in this competitive field.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.finance.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Student Section */}
      <section id="student" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Resumes</h2>
            <p className="text-lg text-gray-600">Student resumes focus on academic achievements, projects, and potential rather than extensive work experience. Our student resume examples help you highlight relevant coursework, internships, and skills that demonstrate your readiness for the professional world.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.student.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Design Section */}
      <section id="design" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Resumes</h2>
            <p className="text-lg text-gray-600">Design professionals create visual solutions that communicate ideas and solve problems. Our design resume examples showcase creative portfolios and technical skills that help you stand out in the competitive creative industry.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.design.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section id="legal" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Legal Resumes</h2>
            <p className="text-lg text-gray-600">Legal professionals navigate complex regulations and advocate for clients across various practice areas. Our legal resume examples demonstrate the analytical thinking and attention to detail that law firms and corporate legal departments seek.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.legal.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Section */}
      <section id="medical" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Medical Resumes</h2>
            <p className="text-lg text-gray-600">Medical professionals provide essential healthcare services and save lives every day. Our medical resume examples highlight clinical skills, certifications, and patient care experience that healthcare employers value most.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resumeExamples.medical.map((example, index) => (
              <Link key={index} href="/sign-up" className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src="/images/templates/StandardTemplate.png"
                      alt={example.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  Go beyond examples of resumes
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get Started With an ATS Resume Template
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                No more worrying about whether the design and format of your resume meets the company&apos;s applicant tracking system requirements. Use one of our professional ATS resume templates now to build your resume and secure your next job interview.
              </p>
              <div>
                <Link 
                  href="/resume-templates" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  View all resume templates
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/preview.svg"
                    alt="Resume Template Preview"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
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

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  The first intelligent resume builder
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The Leading AI Resume Builder Loved By 2.3m+
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Add a job description to tune the AI prompts to generated role-specific content and recommendations.
              </p>
              <div>
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your resume now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto border border-gray-200">
                  <Image
                    src="/images/templates/ai-keyword-tailoring.svg"
                    alt="AI Keyword Tailoring"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
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

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  See the difference in your interview rate
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Content-Focused Features Developed To Get You Hired
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Unleash the full power of your job application with our specially developed, content-focused features and increase your chances of securing your ideal job.
              </p>
              <div>
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your resume now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/templates/menu.svg"
                    alt="Customization Menu"
                    width={150}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
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
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  {/* Template Image */}
                  <div className="aspect-[3/4] overflow-hidden border-b border-gray-200">
                    <Image
                      src="/images/templates/smart-template.png"
                      alt="Smart Resume Template"
                      width={400}
                      height={533}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Template Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Just use this template</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Your application-ready resume will write itself in 5 minutes.
                      </p>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
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
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Article */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none">
                <div className="text-gray-600 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Why Rezum Resume Examples?</h2>
                  
                  <p>
                    Our resume templates are designed with a single goal in mind: to get you past any company&apos;s applicant tracking system (ATS) so you can land an interview at even the most competitive job postings.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Modeled after proven resumes
                  </h3>
                  
                  <p>
                    Our ATS-friendly resume templates have opened doors in competitive fields. Some have reached the hands of hiring managers at top companies like Apple, HubSpot, and Tesla. Using a Rezum resume as a starting point gives you the ultimate headstart.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    ATS compliant formats
                  </h3>
                  
                  <p>
                    All Rezum resumes are built strategically. The formats of our resumes are parsable by the hiring technology companies use for automated screenings.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Modern professional designs
                  </h3>
                  
                  <p>
                    Get a resume that strikes the perfect balance between modern professionalism and ATS compliance. Stand out to recruiters without using overwhelming design elements that aren&apos;t always readable by hiring systems.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    100% focused on content
                  </h3>
                  
                  <p>
                    The content of your resume is what ultimately helps you land interviews. That&apos;s why our resumes double down on communicating your skills and achievements in the most impactful way. This content-focused approach highlights your professional narrative, making your application irresistible to employers.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    How to Make a Perfect ATS-Friendly Resume to Beat the System
                  </h2>
                  
                  <p>Here are the steps for creating an ATS-friendly resume:</p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Have a professional resume format</li>
                    <li>Include the essential resume sections</li>
                    <li>Tailor your resume for one specific role</li>
                    <li>Add numbers and data</li>
                    <li>Optimize your resume using keywords from the job description</li>
                    <li>Check for any spelling, punctuation, and grammar mistakes</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    1. Have a professional resume format
                  </h3>
                  
                  <p>Your resume is a formal document. It should look professional.</p>
                  
                  <p>Here are the main resume format guidelines for a neat job application that&apos;s parsable by applicant tracking systems:</p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Use a reverse chronological structure when listing job positions, projects, and qualifications.</li>
                    <li>Add subtle lining to create a clear division between different sections.</li>
                    <li>Steer away from complex graphical elements, designs, and color.</li>
                    <li>Pick an appropriate font (Arial and Times New Roman will do), with a size no smaller than 10pt and no higher than 12pt.</li>
                    <li>Keep margin size to 1 inch all around, with the lowest being -0.5 inches for compact resumes.</li>
                    <li>Have concise resume bullet points up to 2 lines long (if necessary, extend to 3 lines for in-depth details).</li>
                    <li>Submit your resume in an acceptable format (typically as a PDF or Word document).</li>
                  </ul>
                  
                  <p>
                    Or you could skip most of these steps by using an <Link href="/resume-templates" className="text-amber-600 hover:underline font-semibold">ATS resume template</Link> as a starting point.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2. Include the essential resume sections
                  </h3>
                  
                  <p>The essential sections of a resume typically include the following:</p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Header:</strong> personal information and contact details.</li>
                    <li><strong>Work Experience:</strong> highlight your achievements and impact in previous roles.</li>
                    <li><strong>Education:</strong> showcase academic background and qualifications.</li>
                    <li><strong>Skills:</strong> list core competencies directly related to your career field.</li>
                  </ul>
                  
                  <p>
                    Without these, your resume may get disregarded by the company&apos;s ATS due to inadequate information.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3. Tailor your resume for one specific role
                  </h3>
                  
                  <p>Customize your resume to fit one particular position. This means doing the following:</p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Including achievements directly related to the company&apos;s requirements</li>
                    <li>Highlighting skills and project outcomes that match the job description</li>
                    <li>Writing about the most relevant job positions and responsibilities</li>
                    <li>Showcasing additional sections that prove your areas of expertise</li>
                    <li>Adjusting your resume summary or objectives section to align with the company</li>
                  </ul>
                  
                  <p>
                    Ideally, it&apos;s one resume per organization at a time. Even though the job title might be the same, the job description can vary.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4. Add numbers and data
                  </h3>
                  
                  <p>Specifying your responsibilities and accomplishments with data doesn&apos;t just look good. It increases your chances of getting past the ATS for a few reasons:</p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Concrete numbers offer a clear measure of your success and impact, which can be a factor that the company&apos;s ATS may take into account</li>
                    <li>Quantitative data may enhance the relevance of specific keywords and phrases that the ATS is searching for</li>
                    <li>Demonstrating specific results can help both the hiring manager and the ATS when it comes to determining what candidates to prioritize in the hiring process</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5. Optimize your resume using keywords from the job description
                  </h3>
                  
                  <p>
                    Including keywords from the job description is arguably the most important step for building an ATS-optimized resume.
                  </p>
                  
                  <p>
                    The job posting will likely have keywords that the ATS expects to see on an applicant&apos;s resume. At first glance, this is how recruiters tell whether you match the job description and are a good fit for the role.
                  </p>
                  
                  <p>
                    Scanning through each section of the job description is one way to find resume keywords. The other (and easier) way to do it is by using the <Link href="/keyword-scanner" className="text-amber-600 hover:underline font-semibold">Rezum AI Keyword Targeting</Link> feature.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6. Check for any spelling, punctuation, and grammar Mistakes
                  </h3>
                  
                  <p>
                    Last but not least, an ATS-compliant resume is free from typos and grammar mistakes.
                  </p>
                  
                  <p>
                    Double-check your resume before sending it off. If you&apos;ve been working on your application for hours or even days and your brain feels fried, give yourself a break. Without a fresh pair of eyes, the odds are that you&apos;ll miss some minor details or errors.
                  </p>
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
              Everything you need to know about using Rezum&apos;s Templates and Resume Builder.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is it free?",
                answer: "Yes, Rezum is free to use. Some features require a Pro subscription."
              },
              {
                question: "What Are AI Credits?",
                answer: "Rezum AI Writer is powered by GPT-3 API from OpenAI. This means, with the content you generate, we're \"buying\" the usage of their API."
              },
              {
                question: "How Does Our AI Work?",
                answer: "Rezum partnered with OpenAI to use their GPT-3 neural network. GPT-3 is an innovative and powerful new neural network. We trained it to understand best resume writing practices from our experience and database of resume content. Integrating this AI into Rezum, we are able to transfer expert-quality resume writing at almost no cost."
              },
              {
                question: "How Do I Get AI Credits?",
                answer: "You can get credits in one of two ways: Subscribing to Rezum Pro: We'll give you 100,000 AI Credits to use for content each month. By purchasing more AI Credits: You can also buy AI Credit directly without subscribing."
              },
              {
                question: "Where Do I Use Rezum AI Writer?",
                answer: "First you'll need to create a free Rezum account. The Rezum AI Writer is integrated in the Experience, Projects, and Involvement sections."
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
        title="Ready to Create Your Professional <span class='bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>Resume?</span>"
        subtitle="Join millions of job seekers who have landed their dream jobs with Rezum resume examples and templates."
        ctaText="Get Started Free"
        ctaUrl="/sign-up"
      />

      <DashboardMockup />

      <Footer />
    </div>
  );
}

