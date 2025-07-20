import React from 'react';
import { motion } from 'framer-motion';

const features = [
  { name: 'Javascript', active: true },
  { name: 'Typescript', active: true },
  { name: 'CSS3', active: true },
  { name: 'HTML5', active: true },
  { name: 'Automating', active: true },
  { name: 'Coding Standard', active: true },
  { name: 'User Experience', active: true },
  { name: 'React', active: true },
  { name: 'RESTful', active: true },
  { name: 'Continuous improvement', active: true },
];

const KolabLogo = () => (
  <svg width="36" height="36" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="#48c9b0" stroke="#16a085" strokeWidth="3"/>
    <g fill="#000000">
      <rect x="55" y="40" width="18" height="120" rx="3"/>
      <path d="M65 85 L130 40 L145 55 L80 100 Z" />
      <path d="M80 100 L145 145 L130 160 L65 115 Z" />
    </g>
    <circle cx="100" cy="100" r="90" fill="none" stroke="#20B2AA" strokeWidth="2" opacity="0.3"/>
  </svg>
);

const ResumeCard = ({ name, contact, summary, experience, projects, title }: {
  name: string;
  contact: string;
  summary: string;
  experience: Array<{ title: string; bullets: string[] }>;
  projects: Array<{ title: string; bullets: string[] }>;
  title: string;
}) => (
  <div className="relative h-64 w-52 overflow-hidden rounded-lg border border-gray-600/70 bg-gray-800 text-white shadow-lg hover:shadow-xl transition-shadow duration-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' }}>
    <div className="absolute w-full p-3 font-[Merriweather]">
      <div className="text-[8px] font-semibold">{name}</div>
      <div className="flex w-full justify-center pb-1 text-[5px]">{contact}</div>
      <div className="w-full border-b border-slate-200"></div>
      <div className="uppercase text-[6px] font-semibold mt-1 mb-0.5 w-full border-b border-gray-400 text-left leading-[7px]">Summary</div>
      <div className="text-[5px] leading-[6px] text-left w-full pb-1">{summary}</div>
      <div className="w-full border-b border-slate-200"></div>
      <div className="uppercase text-[6px] font-semibold mt-1 mb-0.5 w-full border-b border-gray-400 text-left leading-[7px]">Experience</div>
      <div>
        {experience.map((exp, index) => (
          <div key={index}>
            <div className="text-left text-[5px] font-semibold">{exp.title}</div>
            <ul className="text-[5px] leading-[6px] text-left w-full pb-0.5 list-inside">
              {exp.bullets.map((bullet, i) => (
                <li key={i} className="-pl-2 flex flex-row pb-[1px]">
                  <span className="px-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="uppercase text-[6px] font-semibold mt-1 mb-0.5 w-full border-b border-gray-400 text-left leading-[7px]">Projects</div>
      <div>
        {projects.map((project, index) => (
          <div key={index}>
            <div className="text-left text-[5px] font-semibold">{project.title}</div>
            <ul className="text-[5px] leading-[6px] text-left w-full pb-0.5 list-inside">
              {project.bullets.map((bullet, i) => (
                <li key={i} className="-pl-2 flex flex-row pb-[1px]">
                  <span className="px-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 z-10 w-full">
      <div className="relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none bg-gray-800 py-0">
        <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 text-white">{title}</div>
        </div>
        <div className="flex h-12 min-w-12 items-center justify-center text-xl text-white">
          <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  </div>
);

const resumeData = [
  {
    name: "Sarah Johnson",
    contact: "San Francisco, CA • sarah.johnson@email.com • (555) 123-4567 • linkedin.com/in/sarah",
    summary: "Experienced QA Engineer with 5+ years in automated testing and quality assurance. Expert in selenium, cypress, and continuous integration pipelines with strong DevOps background.",
    experience: [
      {
        title: "Senior QA Engineer | TechCorp | SF, CA | 2021 - Present",
        bullets: [
          "Designed comprehensive automated test frameworks using Selenium WebDriver and Cypress, reducing manual testing effort by 75% and improving release velocity from monthly to weekly deployments",
          "Led cross-functional testing initiatives across 3 product teams, establishing quality gates and best practices that decreased production bugs by 60% over 18 months"
        ]
      },
      {
        title: "QA Engineer | StartupXYZ | SF, CA | 2019 - 2021",
        bullets: [
          "Built comprehensive end-to-end testing suite covering 90% of critical user workflows, implementing data-driven testing approaches that improved test coverage and reliability",
          "Mentored 2 junior QA engineers in automation best practices, code review processes, and agile testing methodologies, contributing to team growth and knowledge sharing"
        ]
      }
    ],
    projects: [
      {
        title: "Test Automation Framework | 2022",
        bullets: [
          "Built comprehensive testing framework using Selenium, Jenkins CI/CD, and Docker containerization, enabling parallel test execution and reducing overall test runtime by 80%"
        ]
      }
    ],
    title: "QA Engineer"
  },
  {
    name: "Michael Chen",
    contact: "New York, NY • m.chen@email.com • (555) 987-6543 • linkedin.com/in/michaelchen",
    summary: "Full-stack software engineer with 6+ years building scalable web applications. Expertise in React, Node.js, and cloud architecture with focus on performance optimization and user experience.",
    experience: [
      {
        title: "Senior Software Engineer | Meta | NYC, NY | 2020 - Present",
        bullets: [
          "Architected and developed high-performance React applications serving 10M+ daily active users, implementing advanced state management and optimization techniques",
          "Built scalable microservices architecture using Node.js and GraphQL, reducing API response times by 40% and improving system reliability"
        ]
      },
      {
        title: "Software Engineer | Spotify | NYC, NY | 2018 - 2020",
        bullets: [
          "Developed music streaming features using React and TypeScript, contributing to 15% increase in user engagement and platform retention",
          "Implemented real-time data processing pipelines handling 100K+ events per second using Apache Kafka and Redis"
        ]
      }
    ],
    projects: [
      {
        title: "Real-time Analytics Dashboard | 2021",
        bullets: [
          "Created comprehensive analytics platform using React, D3.js, and WebSocket connections, enabling real-time monitoring of key business metrics"
        ]
      }
    ],
    title: "Software Engineer"
  },
  {
    name: "Emily Rodriguez",
    contact: "Austin, TX • emily.rodriguez@email.com • (555) 456-7890 • linkedin.com/in/emilyrodriguez",
    summary: "Product Marketing Manager with 7+ years driving go-to-market strategies for B2B SaaS products. Proven track record in product launches, customer acquisition, and revenue growth.",
    experience: [
      {
        title: "Senior Product Marketing Manager | HubSpot | Austin, TX | 2019 - Present",
        bullets: [
          "Led product launch strategy for enterprise CRM features, resulting in 35% increase in enterprise customer acquisition and $2M ARR growth",
          "Developed comprehensive competitive analysis framework and pricing strategy, contributing to 25% improvement in win rates against key competitors"
        ]
      },
      {
        title: "Product Marketing Manager | Salesforce | Austin, TX | 2017 - 2019",
        bullets: [
          "Managed product positioning and messaging for AI-powered analytics suite, driving 50% increase in product adoption across existing customer base",
          "Created customer success programs and case studies that improved customer retention by 20% and generated 30+ sales qualified leads monthly"
        ]
      }
    ],
    projects: [
      {
        title: "Customer Journey Analytics | 2020",
        bullets: [
          "Implemented advanced customer segmentation and journey mapping using data analytics tools, improving marketing campaign effectiveness by 45%"
        ]
      }
    ],
    title: "Product Marketing Manager"
  },
  {
    name: "David Thompson",
    contact: "Seattle, WA • david.thompson@email.com • (555) 321-0987 • linkedin.com/in/davidthompson",
    summary: "Data Scientist with 5+ years in machine learning and statistical analysis. Specialized in building predictive models and data-driven solutions for business optimization.",
    experience: [
      {
        title: "Senior Data Scientist | Amazon | Seattle, WA | 2021 - Present",
        bullets: [
          "Developed machine learning models for recommendation systems serving 300M+ customers, improving click-through rates by 18% and conversion rates by 12%",
          "Built automated data pipelines using Python, Spark, and AWS services, reducing data processing time by 60% and enabling real-time analytics"
        ]
      },
      {
        title: "Data Scientist | Microsoft | Seattle, WA | 2019 - 2021",
        bullets: [
          "Created predictive analytics models for customer churn prevention, identifying at-risk customers with 85% accuracy and reducing churn by 22%",
          "Implemented A/B testing framework for product features, enabling data-driven decision making across 5 product teams"
        ]
      }
    ],
    projects: [
      {
        title: "Fraud Detection System | 2022",
        bullets: [
          "Built real-time fraud detection system using ensemble machine learning methods, reducing false positives by 40% and improving detection accuracy to 94%"
        ]
      }
    ],
    title: "Data Scientist"
  },
  {
    name: "Jessica Williams",
    contact: "Los Angeles, CA • jessica.williams@email.com • (555) 654-3210 • linkedin.com/in/jessicawilliams",
    summary: "UX/UI Designer with 8+ years creating intuitive digital experiences. Expert in user research, interaction design, and design systems for web and mobile applications.",
    experience: [
      {
        title: "Senior UX Designer | Netflix | Los Angeles, CA | 2020 - Present",
        bullets: [
          "Designed user interface for content discovery features used by 230M+ subscribers, improving user engagement by 28% and content consumption by 15%",
          "Led design system initiative establishing consistent UI patterns across 12 product teams, reducing design-to-development time by 50%"
        ]
      },
      {
        title: "UX Designer | Airbnb | Los Angeles, CA | 2018 - 2020",
        bullets: [
          "Conducted user research and usability testing for booking flow improvements, resulting in 20% increase in conversion rates and enhanced user satisfaction",
          "Designed responsive web and mobile interfaces for host management tools, improving host productivity and platform adoption"
        ]
      }
    ],
    projects: [
      {
        title: "Design System Framework | 2021",
        bullets: [
          "Created comprehensive design system with reusable components and guidelines, adopted by 15+ teams and reducing design inconsistencies by 70%"
        ]
      }
    ],
    title: "UX Designer"
  }
];

export default function DashboardMockup({ mounted = false }: { mounted?: boolean }) {
  return (
    <div className="hidden lg:flex flex-1 bg-[#0f1419] relative overflow-hidden">
      <div className="w-full h-full flex items-center justify-start p-4">
        <div className="relative w-full">
          <div className="relative" style={{ transform: 'scale(1.0) translateX(150px)', transformOrigin: 'left center' }}>
            <div className="flex h-[780px] w-[1100px] rounded-lg border border-[#2d3447] bg-[#1a1f2e] p-4 shadow-2xl">
              
              {/* Sidebar */}
              <aside className="relative h-full w-[240px] overflow-hidden rounded-l-lg bg-[#1a1f2e] border-r border-solid border-r-[#2d3447]">
                <div className="absolute inset-0 z-0">
                  <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#252b3b] to-[#2d3447]">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] animate-pulse" />
                      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] animate-pulse [animation-delay:2s]" />
                      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400 rounded-full filter blur-[100px] animate-pulse [animation-delay:4s]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex w-full flex-col gap-y-5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <KolabLogo />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold text-white">Kolab</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-y-5">
                    <button className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 whitespace-nowrap w-full border-0 bg-[#48c9b0] hover:bg-[#16a085] text-white px-3 py-2 h-9 leading-5 rounded-md text-[13px] tracking-[0.13px]">
                      <span className="px-1">Create new resume</span>
                    </button>
                    
                    <nav className="relative flex flex-auto grow flex-col gap-y-3">
                      <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                        <div className="inline-block relative w-5 h-5">
                          <i className="fad fa-file text-lg" aria-hidden="true"></i>
                        </div>
                        <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">My dashboard</span>
                      </a>
                      <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                        <div className="inline-block relative w-5 h-5">
                          <i className="fad fa-file-lines text-lg" aria-hidden="true"></i>
                        </div>
                        <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">Sample Library</span>
                      </a>
                      <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                        <div className="inline-block relative w-5 h-5">
                          <i className="fas fa-file-alt text-lg" aria-hidden="true"></i>
                        </div>
                        <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">Review my resume</span>
                      </a>
                      <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                        <div className="inline-block relative w-5 h-5">
                          <i className="fad fa-file-waveform text-lg" aria-hidden="true"></i>
                        </div>
                        <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">AI Interview</span>
                      </a>
                    </nav>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="h-full flex-1 rounded-r-lg bg-[#252b3b] px-12 py-8">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex flex-row gap-x-2">
                    <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase whitespace-nowrap tracking-[.12px] bg-[#48c9b0] text-white">Resumes</div>
                    <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase whitespace-nowrap tracking-[.12px] bg-[#2d3447] text-gray-400">Cover Letters</div>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#48c9b0] font-semibold text-white text-sm">A</div>
                    <i className="fas fa-caret-down text-gray-400 text-sm" aria-hidden="true"></i>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8">
                  <ResumeCard {...resumeData[0]} />
                  <ResumeCard {...resumeData[1]} />
                  <ResumeCard {...resumeData[2]} />
                  <ResumeCard {...resumeData[3]} />
                  <ResumeCard {...resumeData[4]} />
                  <div className="col-span-1"></div>
                </div>
              </main>
            </div>

            {/* AI Keyword Targeting Panel */}
            <motion.div
              initial={mounted ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="bg-[#252b3b] rounded-lg border border-[#2d3447] p-4 absolute -left-4 bottom-8 h-[420px] w-[260px] shadow-2xl"
            >
              <div className="flex flex-col gap-y-2">
                <div>
                  <h3 className="text-sm leading-5 font-semibold text-white">
                    AI Keyword Targeting
                  </h3>
                </div>
              </div>
              <span className="inline-block py-2 text-left text-[11px] leading-4 text-gray-400">Great work! You're ranking well for these keywords in the job description:</span>
              <ul className="space-y-1">
                {features.slice(0, 10).map((feature, index) => (
                  <li key={index} className="flex justify-between items-center py-0.5">
                    <span className="text-xs leading-4 font-medium capitalize text-white">{feature.name}</span>
                    <i className="fad fa-circle-check text-[#48c9b0] text-xs" aria-hidden="true"></i>
                  </li>
                ))}
              </ul>
              <span className="inline-block pt-3 pb-1 text-left text-[11px] leading-4 text-gray-400">Want to improve your chances? Consider adding these keywords:</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}