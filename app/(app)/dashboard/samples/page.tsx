// src/pages/dashboard/samples.tsx (or app/dashboard/samples/page.tsx)
import React from 'react';
import SampleCard from "@/components/features/resume/samples/SampleCard";


export interface Sample {
  id: number;
  title: string;
  tag: string;
  companyIcon: string;
  resumeContent: string; // Stores the HTML content for the resume preview
}

const samplesData: Sample[] = [
  {
    id: 1,
    title: 'Disney College Program',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F89625e97-8aeb-41fe-b44d-75da18dffb15.svg?alt=media&token=f15e67d5-9f57-43f7-bbc6-4eb5debdf304',
    // Keeping the full, extensive HTML for the first sample for fidelity.
    // In a real app, this would likely be fetched or managed differently.
    resumeContent: `
      <div id="resume" class="relative bg-surface-2 [&amp;&gt;*]:pointer-events-none [&amp;&gt;*]:select-none false " style="font-size: 9pt; line-height: 1.6; width: 250%; transform: scale(0.4); transform-origin: left top 0px; font-family: Merriweather, serif; padding: 1.3cm 0cm; border-color: rgb(46, 61, 80);" data-type="designStudio" data-format="letter" data-template="standard"><div class="relative z-50 mb-[10px] transition-all"><div class=""><div class="flex flex-row items-end gap-4 pb-2
      false false
      " style="padding-left: 1.4cm; padding-right: 1.4cm;"><div class="grow"><h1 class="font-bold
      text-center !text-gray-900" style="color: rgb(46, 61, 80); font-size: 1.65em; font-family: Merriweather, serif; line-height: inherit;"><span style="color: var(--gray-900); background-color: transparent;" class="false">Charles Bloomberg</span></h1><div class="flex flex-row items-center gap-1 flex-wrap !text-gray-900" style="color: rgb(46, 61, 80); font-weight: 300; font-size: 0.75em; justify-content: center;"><div class="flex flex-row items-center gap-1 !text-gray-900"><svg xmlns="https://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 24 24" class="!fill-gray-900" style="fill: rgb(46, 61, 80); margin-top: -2px;" width="0.9em" height="0.9em"><path d="M12 1.1C7.6 1.1 4.1 4.6 4.1 9c0 5.4 7.1 13.3 7.4 13.7.3.3.8.3 1.1 0S20 14.4 20 9c-.1-4.4-3.6-7.9-8-7.9M12 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4"></path></svg><div class="flex flex-row items-center gap-1"><div class="[&amp;:not(:last-child)]:after:content-[',']">New York City</div><div class="[&amp;:not(:last-child)]:after:content-[',']">New York</div><div class="[&amp;:not(:last-child)]:after:content-[',']">United States</div></div></div><span class="flex flex-row items-center gap-1 !text-gray-900 false"><svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" class="!fill-gray-900" style="fill: rgb(46, 61, 80);" width="0.9em" height="0.9em"><path d="M20.016 8.016V6L12 11.016 3.984 6v2.016L12 12.985zm0-4.032q.797 0 1.383.609t.586 1.406v12q0 .797-.586 1.406t-1.383.609H3.985q-.797 0-1.383-.609t-.586-1.406v-12q0-.797.586-1.406t1.383-.609z"></path></svg><div>charlesbloomberg@wisc.edu</div></span><span class="flex flex-row items-center gap-1 !text-gray-900 false"><svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" class="!fill-gray-900" style="fill: rgb(46, 61, 80);" width="0.9em" height="0.9em"><path d="M19.5 0h-15A1.5 1.5 0 0 0 3 1.5v21A1.5 1.5 0 0 0 4.5 24h15a1.5 1.5 0 0 0 1.5-1.5v-21A1.5 1.5 0 0 0 19.5 0M18 18H6V3h12z"></path></svg><div>(621) 799-5548</div></span><span class="flex flex-row items-center gap-1 !text-gray-900 false"><svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" class="!fill-gray-900" style="fill: rgb(46, 61, 80);" width="0.9em" height="0.9em"><path d="M21.75 0H2.25A2.257 2.257 0 0 0 0 2.25v19.5A2.257 2.257 0 0 0 2.25 24h19.5A2.257 2.257 0 0 0 24 21.75V2.25A2.257 2.257 0 0 0 21.75 0M9 19.5H6V9h3zm-1.5-12C6.67 7.5 6 6.83 6 6s.67-1.5 1.5-1.5S9 5.17 9 6s-.67 1.5-1.5 1.5m12 12h-3v-6c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6h-3V9h3v1.861C14.119 10.013 15.066 9 16.125 9c1.866 0 3.375 1.678 3.375 3.75z"></path></svg><a target="_blank" href="https://www.linkedin.com/in/bloomberg" rel="noreferrer noopener">in/bloomberg</a></span></div></div></div></div><div style="padding: 0cm 1.4cm; margin: 1.05em 0px 10px;"><hr></div><ul class="classNames.sortable_container"><li class="summary group relative leading-snug " style="margin-bottom: 8px; margin-top: 1.05em;"><i class="fas fa-sort absolute left-[20px] top-0 top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div><div class="uppercase
      mb-[4px]


      " data-test-id="resume__section-title" style="font-weight: 600; padding: 0cm 1.4cm; line-height: 1.35em;"><span class="false" style="color: var(--gray-900); background-color: transparent;"><p id="summary-heading" class="editableContent cursor-text  designStudio " style="font-size: 1.15em; display: flex; min-width: 1em; color: var(--gray-900); background-color: transparent; width: fit-content;">Summary</p></span><hr class="mt-px border-0 border-b-[1px] border-black border-gray-900"></div><div class="relative cursor-text whitespace-pre-line focus:outline-none !text-gray-900" style="color: rgb(46, 61, 80); font-weight: 100; font-size: 0.85em; line-height: 1.6; padding: 0cm 1.4cm;"><p id="summary-summary" class="editableContent cursor-text  designStudio ">Creative and versatile writer with an MFA in Themed Entertainment Design and four years of diverse experience in storytelling, show writing, and narrative design. Adept at crafting immersive worlds, writing compelling stories, and designing interactive experiences for theme parks, AI platforms, and entertainment projects. A highly collaborative and adaptable professional with a strong track record of managing complex creative projects and delivering high-quality results.</p></div></div><div style="padding: 0cm 1.4cm; margin: 1.05em 0px 10px;"><hr></div></li><li class="education group relative leading-snug " style="margin-bottom: 8px; margin-top: 1.05em;"><i class="fas fa-sort absolute left-[20px] top-0 top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div><div class="uppercase
      mb-[4px]


      " data-test-id="resume__section-title" style="font-weight: 600; padding: 0cm 1.4cm; line-height: 1.35em;"><span class="false" style="color: var(--gray-900); background-color: transparent;"><p id="education-heading" class="editableContent cursor-text  designStudio " style="font-size: 1.15em; display: flex; min-width: 1em; color: var(--gray-900); background-color: transparent; width: fit-content;">Education</p></span><hr class="mt-px border-0 border-b-[1px] border-black border-gray-900"></div><ul class="sortable-container "><div class="flex flex-col"><li class="b9305124-a2a5-42bb-87c5-168e79648988 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm; margin-bottom: 11px;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div id="page-breaker__b9305124-a2a5-42bb-87c5-168e79648988" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class=""><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="b9305124-a2a5-42bb-87c5-168e79648988-qualification" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">Master of Fine Arts, Themed Entertainment Design</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="b9305124-a2a5-42bb-87c5-168e79648988-institution" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Savannah College of Art and Design (SCAD)</span></span><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="b9305124-a2a5-42bb-87c5-168e79648988-location" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Savannah, GA</span></span><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="b9305124-a2a5-42bb-87c5-168e79648988-date" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">2024</span></span></div><div class="flex flex-wrap" style="color: var(--gray-900);"></div></div></div><div class="relative whitespace-pre-line leading-6 !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="b9305124-a2a5-42bb-87c5-168e79648988-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Coursework included creative writing, spatial design, immersive storytelling, and interactive experience design..</li></ul></span></div></div></div></li><li class="18d8f381-3b47-49a8-a8eb-927661b0099b group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div id="page-breaker__18d8f381-3b47-49a8-a8eb-927661b0099b" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class=""><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="18d8f381-3b47-49a8-a8eb-927661b0099b-qualification" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">Bachelor of Arts, English and Creative Writing</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="18d8f381-3b47-49a8-a8eb-927661b0099b-institution" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Allegheny College</span></span><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="18d8f381-3b47-49a8-a8eb-927661b0099b-location" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Meadville, PA</span></span><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style="font-size: 0.85em; line-height: 1.6;"><span id="18d8f381-3b47-49a8-a8eb-927661b0099b-date" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">2021</span></span></div><div class="flex flex-wrap" style="color: var(--gray-900);"></div></div></div><div class="relative whitespace-pre-line leading-6 !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="18d8f381-3b47-49a8-a8eb-927661b0099b-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Specialized in fiction, nonfiction, poetry, and short script writing, with a focus on world-building and narrative development..</li></ul></span></div></div></div></li></div></ul></div><div style="padding: 0cm 1.4cm; margin: 1.05em 0px 10px;"><hr></div></li><li class="experience group relative leading-snug " style="margin-bottom: 8px; margin-top: 1.05em;"><i class="fas fa-sort absolute left-[20px] top-0 top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div><div class="uppercase
      mb-[4px]


      " data-test-id="resume__section-title" style="font-weight: 600; padding: 0cm 1.4cm; line-height: 1.35em;"><span class="false" style="color: var(--gray-900); background-color: transparent;"><p id="experience-heading" class="editableContent cursor-text  designStudio " style="font-size: 1.15em; display: flex; min-width: 1em; color: var(--gray-900); background-color: transparent; width: fit-content;">Experience</p></span><hr class="mt-px border-0 border-b-[1px] border-black border-gray-900"></div><div class="flex flex-col" style="line-height: 1.6em;"><ul class="sortable-container "><li class="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm; margin-bottom: 11px;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div id="page-breaker__dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class="" style="line-height: 1em;"><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15-role" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">Writer</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-semibold" style="font-size: 0.85em; line-height: 1.6;"><span id="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15-company" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Outlier AI Inc.</span></span></div><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="inline-block before:absolute before:first:hidden " style="font-size: 0.85em;"><span id="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15-duration" class="editableContent cursor-text leading-snug ml-0 designStudio " style="color: var(--gray-900);">March 2024 – Present</span></span><span class="inline-block before:absolute before:first:hidden before:content-[',_']" style="font-size: 0.85em;"><span id="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15-location" class="editableContent cursor-text leading-snug ml-2 designStudio " style="color: var(--gray-900);">Remote</span></span></div></div></div><div class="text-[0.85em] relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="dbf4f1e6-5e9f-4635-a266-a2ccdc0a4d15-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Authored creative and factual responses to enhance the performance and responsiveness of AI-driven systems.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Refined prompts and content to improve AI adaptability to user queries, with a focus on creative writing and technical accuracy.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Conducted fact-checking and content analysis to ensure quality and consistency across AI outputs..</li></ul></span></div></div></div></li><li class="cfd421b7-1513-42ac-843c-db45ffd16f38 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm; margin-bottom: 11px;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div id="page-breaker__cfd421b7-1513-42ac-843c-db45ffd16f38" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class="" style="line-height: 1em;"><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="cfd421b7-1513-42ac-843c-db45ffd16f38-role" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">Recreation Assistant (Key Holder)</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-semibold" style="font-size: 0.85em; line-height: 1.6;"><span id="cfd421b7-1513-42ac-843c-db45ffd16f38-company" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">NSA Mechanicsburg</span></span></div><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="inline-block before:absolute before:first:hidden " style="font-size: 0.85em;"><span id="cfd421b7-1513-42ac-843c-db45ffd16f38-duration" class="editableContent cursor-text leading-snug ml-0 designStudio " style="color: var(--gray-900);">July 2023 – Present</span></span><span class="inline-block before:absolute before:first:hidden before:content-[',_']" style="font-size: 0.85em;"><span id="cfd421b7-1513-42ac-843c-db45ffd16f38-location" class="editableContent cursor-text leading-snug ml-2 designStudio " style="color: var(--gray-900);">Mechanicsburg, PA</span></span></div></div></div><div class="text-[0.85em] relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="cfd421b7-1513-42ac-843c-db45ffd16f38-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Managed facility access, verified credentials, and issued keys to authorized personnel.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Maintained a safe and clean environment by overseeing sanitation and enforcing facility policies.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Opened and closed the fitness center in accordance with military protocols, showcasing reliability and time management..</li></ul></span></div></div></div></li><li class="d335c4e7-19db-40d9-931b-b448cc1c71f5 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div id="page-breaker__d335c4e7-19db-40d9-931b-b448cc1c71f5" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class="" style="line-height: 1em;"><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="d335c4e7-19db-40d9-931b-b448cc1c71f5-role" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">Team Member</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="flex before:mr-1 before:content-['•_'] before:first:hidden font-semibold" style="font-size: 0.85em; line-height: 1.6;"><span id="d335c4e7-19db-40d9-931b-b448cc1c71f5-company" class="editableContent cursor-text mr-1 whitespace-pre-wrap designStudio " style="display: inline; vertical-align: initial; color: var(--gray-900);">Follett Higher Education Group</span></span></div><div class="flex flex-wrap" style="color: var(--gray-900);"><span class="inline-block before:absolute before:first:hidden " style="font-size: 0.85em;"><span id="d335c4e7-19db-40d9-931b-b448cc1c71f5-duration" class="editableContent cursor-text leading-snug ml-0 designStudio " style="color: var(--gray-900);">September 2023 – June 2024</span></span><span class="inline-block before:absolute before:first:hidden before:content-[',_']" style="font-size: 0.85em;"><span id="d335c4e7-19db-40d9-931b-b448cc1c71f5-location" class="editableContent cursor-text leading-snug ml-2 designStudio " style="color: var(--gray-900);">Savannah, GA</span></span></div></div></div><div class="text-[0.85em] relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="d335c4e7-19db-40d9-931b-b448cc1c71f5-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Provided excellent customer service by resolving inquiries, processing returns, and handling transactions efficiently.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Trained new employees, fostering teamwork and ensuring a seamless onboarding process.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Demonstrated extensive product knowledge to assist students and faculty with academic-related purchases and questions..</li></ul></span></div></div></div></li></ul></div></div><div style="padding: 0cm 1.4cm; margin: 1.05em 0px 10px;"><hr></div></li><li class="projects group relative leading-snug " style="margin-bottom: 8px; margin-top: 1.05em;"><i class="fas fa-sort absolute left-[20px] top-0 top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div><div class="uppercase
      mb-[4px]


      " data-test-id="resume__section-title" style="font-weight: 600; padding: 0cm 1.4cm; line-height: 1.35em;"><span class="false" style="color: var(--gray-900); background-color: transparent;"><p id="projects-heading" class="editableContent cursor-text  designStudio " style="font-size: 1.15em; display: flex; min-width: 1em; color: var(--gray-900); background-color: transparent; width: fit-content;">Projects</p></span><hr class="mt-px border-0 border-b-[1px] border-black border-gray-900"></div><div class="flex flex-col" style="line-height: 1.6em;"><ul class="sortable-container "><li class="58923f77-c6d7-4130-b39c-804a38aaf91f group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 hidden" aria-hidden="true"></i><div id="page-breaker__58923f77-c6d7-4130-b39c-804a38aaf91f" data-test-id="page-breaker"><div data-test-id="page-breaker__content"><div class="" style="line-height: 1.2em;"><div class="flex gap-2"><span><div class="flex flex-row text-[1em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style="color: var(--gray-900);"><span id="58923f77-c6d7-4130-b39c-804a38aaf91f-title" class="editableContent cursor-text text-[1em] leading-snug ml-0 designStudio " style="color: var(--gray-900);">What Once Was (BA Final Composition)</span></div></span></div><div class="flex justify-between gap-2 font-semibold"><div class="flex flex-wrap" style="color: var(--gray-900);"></div><div class="flex flex-wrap" style="color: var(--gray-900);"></div></div></div><div class="relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); line-height: 1.6em; font-size: 0.85em; font-weight: 100;"><span id="58923f77-c6d7-4130-b39c-804a38aaf91f-description" class="editableContent cursor-text  designStudio "><ul class="line-inline m-0 list-none p-0 pl-1.5"><li class="relative before:absolute before:left-[-7px] before:content-['•']">Authored a collection of short stories exploring themes of loss, resilience, and female empowerment.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Featured a standout story, Skyfall, which inspired worldbuilding elements later incorporated into The Artemis Project.</li><li class="relative before:absolute before:left-[-7px] before:content-['•']">Demonstrated versatility in writing styles and genres, receiving accolades from professors and peers for originality and depth..</li></ul></span></div></div></div></li></ul></div></div><div style="padding: 0cm 1.4cm; margin: 1.05em 0px 10px;"><hr></div></li><li class="skills group relative leading-snug " style="margin-top: 1.05em;"><i class="fas fa-sort absolute left-[20px] top-0 top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div><div class="uppercase
      mb-[4px]


      " data-test-id="resume__section-title" style="font-weight: 600; padding: 0cm 1.4cm; line-height: 1.35em;"><span class="false" style="color: var(--gray-900); background-color: transparent;"><p id="skills-heading" class="editableContent cursor-text  designStudio " style="font-size: 1.15em; display: flex; min-width: 1em; color: var(--gray-900); background-color: transparent; width: fit-content;">Skills</p></span><hr class="mt-px border-0 border-b-[1px] border-black border-gray-900"></div><div class="flex flex-col" style="line-height: 2em;"><ul class="sortable-container "><li class="5cde095d-e75e-4dc9-b124-4acd5dada59b group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm; margin-bottom: 6.75px;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div class="relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); font-weight: 400; font-size: 0.85em;"><p id="5cde095d-e75e-4dc9-b124-4acd5dada59b-skill" class="editableContent cursor-text  designStudio ">Software Proficiency: Adobe Creative Suite, Final Draft, Clip Studio Paint</p></div></li><li class="6224143e-37dc-4d9f-bc94-03e22eeb29e2 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm; margin-bottom: 6.75px;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div class="relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); font-weight: 400; font-size: 0.85em;"><p id="6224143e-37dc-4d9f-bc94-03e22eeb29e2-skill" class="editableContent cursor-text  designStudio ">Other Skills: Quick Sketch, Digital Painting, Storyboarding, Pitching, Project Management, Collaboration</p></div></li><li class="335de886-64e9-4d07-80e9-b4e88dfeac47 group relative leading-snug " style="padding-left: 1.4cm; padding-right: 1.4cm;"><i class="fas fa-sort absolute left-[20px] null top-1
      z-50 cursor-grab text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 " aria-hidden="true"></i><div class="relative whitespace-pre-line !text-gray-900" style="color: rgb(46, 61, 80); font-weight: 400; font-size: 0.85em;"><p id="335de886-64e9-4d07-80e9-b4e88dfeac47-skill" class="editableContent cursor-text  designStudio ">Creative and Technical Skills: Show Writing, Narrative Design, Copywriting, Fiction and Nonfiction Writing, Worldbuilding (Theme Park and Narrative), Screenwriting, Story Development</p></div></li></ul></div></div></li></ul></div>
    `,
  },
  {
    id: 2,
    title: 'Senior Project Manager',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Faf268829-8a65-40a0-aae3-c9c7d5278083.svg?alt=media&token=183faa34-9f9a-4141-83e2-71b578a28f4d',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9pt; transform: scale(0.4); transform-origin: left top;">
      <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">John Doe</h2>
      <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">New York, NY | (123) 456-7890 | john.doe@email.com</p>
      <hr style="border-top: 1px solid black; margin: 1em 0;">
      <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
      <p style="font-size: 0.85em; line-height: 1.5;">Project Manager with 3+ years of demonstrated history of working in the Information Technology and Geo-Systems industry. Strong background in finance and Master's degree focused on Strategic Management.</p>
      <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
      <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Marketing Project Coordinator | Company A</h4>
      <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2021 - Present | New York, NY</p>
      <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
        <li>Managed creation of new websites for global product releases to increase awareness and sales.</li>
        <li>Led a small team to produce digital content (landing pages, blogs, and videos) generating over 1,000 new sales qualified leads.</li>
        <li>Supported launch strategy and facilitated cross-departmental collaboration.</li>
      </ul>
      </div>`,
  },
  {
    id: 3,
    title: 'Corporate Rotational Graduate',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Fd835c4d2-9ed2-45ee-b6d8-ee0c7e1a4653.svg?alt=media&token=1d815adb-42f7-4b95-abf5-a221f5be1d56',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9pt; transform: scale(0.4); transform-origin: left top;">
      <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Jane Doe</h2>
      <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">London, UK | (987) 654-3210 | jane.doe@email.com</p>
      <hr style="border-top: 1px solid black; margin: 1em 0;">
      <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
      <p style="font-size: 0.85em; line-height: 1.5;">Graduating from a 3-year rotational corporate study program and several extracurricular activities, I've found joy in creating value for people by creating digital products. Analytical/structured person with a hands-on down to earth personality that loves to learn.</p>
      <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
      <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Corporate Student Year 3 | Company A</h4>
      <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
      <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
        <li>Conducted data preparation and crunching with Data Scientists to improve existing machine learning capabilities.</li>
        <li>Explored social media data for leveraging by the Data Science team.</li>
        <li>Participated in various innovation projects.</li>
      </ul>
      </div>`,
  },
  {
    id: 4,
    title: 'Assistant Policy Intern',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F9750b220-03dd-49ae-8696-a11ddde444cf.svg?alt=media&token=af4f1078-e1a5-46fe-b77a-bf9c7009156a',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Michael Brown</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">San Francisco, CA | (555) 123-4567 | michael.brown@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.5;">As a great communicator, outcome-focused and process-oriented professional, I am seeking a challenging opportunity to become a Business Analyst where my advanced skills, education, extensive training and years of experience can be fully utilised.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Senior Project Officer | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Developed strategic plans and operational plans following stakeholders’ requirements.</li>
          <li>Awarded “I Love Data” award by the funding body due to my contribution to business process and model improvements.</li>
          <li>Championed three business digital transformation projects.</li>
        </ul>
        </div>`,
  },
    {
    id: 5,
    title: 'IT Security Architect',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F794c384f-78c7-49ed-81f7-5172ed5ba1b3.svg?alt=media&token=75127a39-cfe5-45de-b5a2-98a9285b2e7d',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Emily White</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Seattle, WA | (222) 333-4444 | emily.white@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.8;">I have been working in IT for over 25 years. I now focus on IT security which includes systems, networks, and people. I have an entrepreneurial mindset and I enjoy showing people how to be more secure while still being highly productive.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">IT Security Architect | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Managed security architecture to include perimeter security network.</li>
          <li>Designed and implemented a highly segmented network with a focus on zero trust.</li>
          <li>Implemented multiple information security initiatives including Single Sign On (SSO) with Multi-Factor Authentication (MFA).</li>
        </ul>
        </div>`,
    },
    {
    id: 6,
    title: 'Data Engineer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F79b9853a-e60f-4c7f-af6d-aacf776b2bea.svg?alt=media&token=027cb6fe-1160-494c-ab35-d7304b426ce1',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">David Lee</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Boston, MA | (111) 222-3333 | david.lee@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.8;">Fearless problem solver with a specialization in high scale analytic workloads running on Microsoft SQL Server. For the last 7 years, I have built understanding of each level of the SQL Server database ecosystem seeking to become an end-to-end expert.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Software Engineer | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Developed for a de-identified research data warehouse compiling information from over 100 million patients.</li>
          <li>Collaborated with data scientists and physicians to design and build data models for studying the Covid-19 pandemic.</li>
          <li>Designed and implemented functionality to connect physicians with other physicians treating patients with similar rare conditions or symptoms.</li>
        </ul>
        </div>`,
    },
    {
    id: 7,
    title: 'SAP Developer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Fa974c595-7367-4f22-9049-cb88b9b287f5.svg?alt=media&token=efd89f96-080f-47d1-9a21-0fec19b79fd8',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 8.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Sarah Green</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Chicago, IL | (444) 555-6666 | sarah.green@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.75;">Solution Advisor with experience and track record specialized in Customer Experience (CX) and CRM technology in South East Asia markets. Skilled in end to end Customer Experience technology from CRM, Marketing, CIAM, and Commerce platforms.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Senior Solution Advisor for Customer Experience | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Managed a portfolio of cross-functional Customer Experience products.</li>
          <li>Developed a sales strategy to increase market share by becoming a digital champion at SAP.</li>
          <li>Conducted needs assessments with customers, identified core business issues, and delivered solutions.</li>
        </ul>
        </div>`,
    },
    {
    id: 8,
    title: 'Software Developer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F6b8305a8-e484-4898-8676-fbebe8c6a852.svg?alt=media&token=79dca2dd-91f3-495a-8433-6ab3626c91ad',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Olivia White</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Austin, TX | (777) 888-9999 | olivia.white@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.5;">Highly-skilled and motivated software engineer with 3 years of experience. Passionate about building world-class products through proven software development and engineering skills.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Software Engineer (Associate) | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Led the development of a service that provides automated pen-testing to internal front-office facing teams.</li>
          <li>Developed a web application that orchestrates vendor vulnerability scanners to scan over 100,000 cloud and hardware infrastructure.</li>
          <li>Led the analyst peer mentoring committee for Jersey City by conducting event planning, budget analysis, mentor and mentee pairing.</li>
        </ul>
        </div>`,
    },
    {
    id: 9,
    title: 'Creative Producer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Ff53312ee-7ff9-4e9e-9114-dac3e65bea52.svg?alt=media&token=de04d5e7-ac50-4383-bdc8-eda7ebd51ee2',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Daniel Martinez</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Los Angeles, CA | (999) 888-7777 | daniel.m@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.5;">A production professional with experience creating solutions for the most demanding video content challenges. I’m a proven successful collaborator with multi-disciplinary teams, artists and personalities.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Creative Producer | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Functions internally with executive and marketing teams on the creation of video content, photography and graphic design.</li>
          <li>Sole producer in the company, owning all visual content.</li>
          <li>Coordinates with technical teams, executive teams and sales to produce messaging and content.</li>
        </ul>
        </div>`,
    },
    {
    id: 10,
    title: 'Senior Data Analyst',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Ff1126bd8-dd47-42ca-957d-5d35d3c2b046.svg?alt=media&token=58d63961-85c1-4226-9a29-12d188d8cc7a',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Sophia Adams</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">London, UK | (123) 456-7890 | sophia.a@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.8;">Analytics Consultant with 11 years consulting experience, including 4 years experience delivering analytics solutions across European and Australian clients within the Financial Services, Government and Energy &amp; Utilities industries.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Senior Analytics Consultant | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Developed a Python-based NLP model to match customer correspondence with customer records.</li>
          <li>Led a team of three consultants in designing, building and deploying a Python-based model to detect RIFA (Red Imported Fire Ant) nests.</li>
          <li>Designed and automated Change Management reports for offshore Oil and Gas extraction projects.</li>
        </ul>
        </div>`,
    },
    {
    id: 11,
    title: 'Customer Service Representative',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F02fe8e9d-9457-4f0e-8f56-b33869758c25.svg?alt=media&token=905f069c-98cb-4f19-bfa5-ba2eda8839ad',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">James Wilson</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Dallas, TX | (111) 222-3333 | james.w@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.65;">Business analyst, with experience in Asia, looking for leadership role in a growing organization. Daniel has a Passion for data related forensic and investigative work and visualization, solving problems, automation, and language.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">International Capacity Planner | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Created metric dashboards for the planning group, including multiple predictive models that guide a $2B business.</li>
          <li>Visualized data in Tableau to provide an operational dashboard projecting future inventory 20 weeks forward.</li>
          <li>Automated reporting for the department, saving approximately 2-5 hours weekly per report.</li>
        </ul>
        </div>`,
    },
    {
    id: 12,
    title: 'Database Administrator - Georgia Tech',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F9987b510-39f4-4858-92cf-4ef02bfc685a.svg?alt=media&token=0c4b3b59-1326-416e-8e84-6b02732ad46d',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Patricia Taylor</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Atlanta, GA | (444) 555-6666 | patricia.t@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Education</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Masters of Science in Computational Analytics | Georgia Institute of Technology</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">Expected 2023 | Atlanta, GA</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Specialized coursework in data science, machine learning, and algorithm design.</li>
          <li>Participated in research projects focused on large-scale data processing and predictive modeling.</li>
          <li>Developed advanced analytical skills using Python, R, and SQL.</li>
        </ul>
        </div>`,
    },
    {
    id: 13,
    title: 'Technology Internship',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2F4314ee14-edf8-49e0-8d4e-696460f31cf3.svg?alt=media&token=7e422dd5-3b0f-4488-a6ed-0eff933f1621',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Robert Moore</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">San Jose, CA | (777) 888-9999 | robert.m@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.7;">Bachelors of comp. engineering student with experience in professional settings in addition to academic and self-direct side projects.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Hardware Validation Intern | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Executed test plan and collaborated with co-workers in a fast-paced environment to perform USB Validation across all design layers.</li>
          <li>Developed and maintained an SQL database in order to centralize and simplify the testing process.</li>
          <li>Developed scripts using Windows command line and PowerShell to automate aspects of the job.</li>
        </ul>
        </div>`,
    },
    {
    id: 14,
    title: 'Embedded Software Developer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Fa8402626-75ee-4800-83e3-5ca1eddfcee4.svg?alt=media&token=661e3fde-c34f-4fa4-9b0c-da3780abc42e',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 10pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Jessica Hall</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">Dublin, Ireland | (+353) 123-4567 | jessica.h@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.7;">A talented Computer Systems graduate with a strong academic background and some commercial experience. A proven ability to think through complex problems coupled with the confidence to make ideas heard. Interested in all things computer networks, security, and cloud.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Education</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Master Of Engineering In Information And Network Security | University of Limerick</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">2021 | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Specialized in advanced network security protocols and incident response.</li>
          <li>Gained expertise in cloud security and ethical hacking.</li>
        </ul>
        </div>`,
    },
    {
    id: 15,
    title: 'Front-End Engineer',
    tag: 'PRO',
    companyIcon: 'https://firebasestorage.googleapis.com/v0/b/rezi-3f268.appspot.com/o/sample-assets%2Ff91355eb-c8c8-43f0-94a3-d12154f1e579.svg?alt=media&token=43b17ad9-1b3b-4722-92df-b8745d57d369',
    resumeContent: `<div style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9.5pt; transform: scale(0.4); transform-origin: left top;">
        <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Christopher Clark</h2>
        <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em;">São Paulo, Brazil | (55) 11-99999-0000 | christopher.c@email.com</p>
        <hr style="border-top: 1px solid black; margin: 1em 0;">
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
        <p style="font-size: 0.85em; line-height: 1.85;">Full-stack developer with proven technical, organizational, and communication skills, working with Agile and designing software solutions. Offering strong Vue skills and working experience with SQL(PostgreSQL), .NET Core, Javascript frameworks, and more.</p>
        <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
        <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Full Stack Engineer | Company A</h4>
        <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em;">June 2020 - Present | New York, NY</p>
        <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
          <li>Development of APIs in .NET Core for thousands of students of the Ânima institution.</li>
          <li>Used design patterns such as DDD and TDD and implemented software principles like SOLID and Clean Code.</li>
          <li>Carried out the implementation of modern technologies such as git commitizen and best practices with Xunity (.NET Core).</li>
        </ul>
        </div>`,
    },
];

const SamplesPage: React.FC = () => {
  return (
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16">
      <div
        className="relative flex w-[100vw] flex-col gap-4 md:gap-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8"
        id="layout_full_screen"
      >
        <main className="w-full sm:h-full lg:h-auto">
          {/* Page Header */}
          <div className="mt-6 flex flex-row items-center justify-between self-stretch">
            <div className="text-3xl font-semibold leading-9">Search Sample Library</div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex w-full flex-col items-center gap-6 self-stretch pt-6">
            {/* Search Form */}
            <form className="relative flex w-[100%] flex-row items-center justify-start self-stretch">
              <div className="flex w-full flex-col gap-1">
                {/* Keeping 'bg-input-bg' and 'border-input-stroke' as assumed external CSS vars/classes */}
                <div className="w-[100%] h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded group-[.company-found]:rounded-b-none transition-all duration-200 group-[.company-found]:border-purple-200 border-input-stroke px-3 py-1 bg-input-bg gap-1">
                  {/* Font Awesome Icon - ensure Font Awesome is set up to render "fad" icons, or replace with SVG */}
                  <i className="fad fa-magnifying-glass !flex h-6 !w-6 justify-center items-center" aria-hidden="true"></i>
                  <input
                    autoComplete="off"
                    className="bg-input-bg text-gray-900 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-300 text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    name=""
                    placeholder="Search resume and cover letter samples by role or skill"
                    accept=""
                    defaultValue="" // Use defaultValue in React for initial value in uncontrolled components
                  />
                </div>
              </div>
            </form>

            {/* Mobile Category Dropdown */}
            <div className="block w-full sm:hidden">
              <div className="w-full">
                <div className="relative">
                  {/* Keeping inline style to preserve original HTML's font-weight declaration */}
                  <select
                    className="h-10 sm:h-12 pl-4 text-base leading-6 pr-4 py-1 rounded w-full ellipsis cursor-pointer font-semibold text-gray-900 bg-input-bg text-gray-300 border-2 border-input-stroke border-solid"
                    style={{ fontWeight: 600 }}
                  >
                    <option value="">Pro</option>
                    <option value="business">Business</option>
                    <option value="programming">Programming</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="student">Student</option>
                    <option value="medical">Medical</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="legal">Legal</option>
                    <option value="other">Other</option>
                  </select>
                  {/* The hidden div with options for a custom select would typically involve JS to show/hide */}
                  <div className="relative hidden">
                    <div className="border border-input-stroke rounded w-full shadow-sm overflow-auto z-[999] cursor-pointer absolute max-h-48">
                      <div className="flex justify-start items-center px-[0.6em] min-h-12 font-semibold bg-input-bg text-gray-900 hover:bg-primary hover:text-white data-[disabled=true]:bg-input-bg-disabled data-[disabled=true]:text-gray-300 !bg-slate-100 hover:!text-gray-900 capitalize">
                        Pro
                      </div>
                      <div className="flex justify-start items-center px-[0.6em] min-h-12 font-semibold bg-input-bg text-gray-900 hover:bg-primary hover:text-white data-[disabled=true]:bg-input-bg-disabled data-[disabled=true]:text-gray-300">
                        Business
                      </div>
                      {/* ... other options from the original HTML would also be here */}
                    </div>
                  </div>
                  <div className="hidden" id="option-portal"></div>
                </div>
              </div>
            </div>

            {/* Desktop Category Tabs */}
            <div className="hidden w-full sm:flex">
              <nav className="flex content-center gap-2 self-stretch flex-wrap min-h-[32px]">
                {/* Replaced !bg-rezi-blue with !bg-resume-blue-500 and data-[active=true]:bg-rezi-blue-600 with data-[active=true]:bg-resume-blue-600 based on config */}
                <a id="unsafe-nav-0" aria-label="Pro" href="/dashboard/samples/pro">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer !bg-resume-blue-500 text-white flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0} // tabindex as number
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Pro
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-1" aria-label="Business" href="/dashboard/samples/business">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Business
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-2" aria-label="Programming" href="/dashboard/samples/programming">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Programming
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-3" aria-label="Engineering" href="/dashboard/samples/engineering">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Engineering
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-4" aria-label="Marketing" href="/dashboard/samples/marketing">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Marketing
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-5" aria-label="Design" href="/dashboard/samples/design">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Design
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-6" aria-label="Student" href="/dashboard/samples/student">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Student
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-7" aria-label="Medical" href="/dashboard/samples/medical">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Medical
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-8" aria-label="Finance" href="/dashboard/samples/finance">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Finance
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-9" aria-label="Education" href="/dashboard/samples/education">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Education
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-10" aria-label="Legal" href="/dashboard/samples/legal">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Legal
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-11" aria-label="Other" href="/dashboard/samples/other">
                  <div
                    className="rounded-md bg-tab-normal hover:bg-tab-hover focus:bg-tab-focus flex items-center h-6 px-2 text-xs cursor-pointer hover:!bg-tab-hover text-gray-900 flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 -all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px] bg-grey-100 data-[active=true]:bg-resume-blue-600 data-[active=true]:text-white"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Other
                      </span>
                    </div>
                  </div>
                </a>
              </nav>
            </div>
          </div>

          {/* Samples Grid */}
          <div className="flex w-full flex-row flex-wrap gap-4 md:gap-6">
            {samplesData.map((sample: Sample) => (
              <SampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SamplesPage;