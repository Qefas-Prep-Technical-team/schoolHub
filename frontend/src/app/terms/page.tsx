import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Qefas Hub',
  description: 'Terms of Service governing the use of the Qefas Hub school management and learning platform.',
};

export default function TermsOfService() {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p>
            Welcome to Qefas Hub (&ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing, registering for, or using our school management systems, mobile applications, dashboard portals, or related services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy.
          </p>
          <p className="mt-3">
            If you are entering into these Terms on behalf of a school, educational institution, or other legal entity, you represent and warrant that you have the authority to bind such entity to these Terms. If you do not agree to these Terms, you must not access or use the Service.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      title: '2. User Accounts and Registration',
      content: (
        <>
          <p>
            To access certain features of the Platform, you must register for an account. We offer portals tailored for four main categories of users: School Administrators, Teachers, Students, and Parents.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Accuracy of Information:</strong> You agree to provide accurate, current, and complete information during the registration process and to keep your credentials updated.</li>
            <li><strong>Account Security:</strong> You are entirely responsible for maintaining the confidentiality of your account credentials (usernames and passwords) and for any and all activities that occur under your account. You must notify us immediately of any unauthorized use or security breach.</li>
            <li><strong>User Access Level:</strong> Users may only access the portal designated for their role. Unauthorized attempts to gain administrative privileges or access other user types' interfaces will result in immediate account termination.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'billing',
      title: '3. Subscriptions, Fees, and Billing',
      content: (
        <>
          <p>
            Certain components of the Platform are available on a subscription basis. By signing up for a paid plan, you agree to pay the fees associated with your chosen tier (monthly, quarterly, or annually).
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Payment Terms:</strong> All payments are processed securely via third-party billing providers (e.g., Paystack). You authorize us to charge your payment method for recurring subscription fees until canceled.</li>
            <li><strong>Free Trials:</strong> If you register for a free trial, we will make the Service available to you free of charge until the end of the trial period. Upon expiration, access to premium features will be suspended unless a paid subscription is activated.</li>
            <li><strong>Cancellation and Refunds:</strong> You may cancel your subscription at any time via your billing dashboard. Subscription fees are non-refundable except as required by law or as expressly stated in a specific promotion. Upon cancellation, you will retain access until the end of your billing cycle.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'educational-data',
      title: '4. Educational Records and Compliance',
      content: (
        <>
          <p>
            Qefas Hub is designed to assist schools in managing student information, grades, attendance, and administrative records. 
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Data Ownership:</strong> As between Qefas Hub and the school, the school retains ownership of all student and institutional data imported or generated through the Platform (&ldquo;School Data&rdquo;). Qefas Hub acts strictly as a data processor for School Data.</li>
            <li><strong>FERPA & COPPA Compliance:</strong> The school is responsible for obtaining any necessary parental consent for student accounts, particularly for students under the age of 13, in compliance with the Children&rsquo;s Online Privacy Protection Act (COPPA), the Family Educational Rights and Privacy Act (FERPA), and applicable local privacy laws.</li>
            <li><strong>AI Scan & Reconciliation:</strong> The Platform may provide premium automated features, such as OCR/AI exam grading scanners. The final verification and reconciliation of any automatically extracted grades remain the absolute responsibility of the school and its certified teachers.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'conduct',
      title: '5. Acceptable Use and Restrictions',
      content: (
        <>
          <p>
            You agree to use Qefas Hub solely for lawful educational and administrative purposes. You shall not:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Copy, modify, distribute, or reverse engineer any part of the Platform or source code.</li>
            <li>Use automated scrapers, web spiders, or data mining software to extract contents, user listings, or institutional information from the Platform.</li>
            <li>Attempt to probe, scan, or test the vulnerability of our systems, networks, or API interfaces without explicit authorization.</li>
            <li>Upload or transmit files containing viruses, malware, trojan horses, or corrupted files designed to interrupt or damage Platform services.</li>
            <li>Submit fraudulent grade sheets, attendance logs, or false identity credentials.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: '6. Intellectual Property Rights',
      content: (
        <>
          <p>
            All right, title, and interest in and to the Platform (excluding School Data), including the user interfaces, software code, platform architecture, design system, website copy, icons, illustrations, graphics, and trade marks are and will remain the exclusive property of Qefas Hub and its licensors.
          </p>
          <p className="mt-3">
            Nothing in these Terms grants you a license to use our trademarks, brand names, or logos without prior written consent.
          </p>
        </>
      ),
    },
    {
      id: 'disclaimers',
      title: '7. Warranty Disclaimers',
      content: (
        <>
          <p>
            THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, QEFAS HUB DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-3">
            WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ACCURATE, FREE OF ERROR, OR THAT ANY DEFECTS WILL BE CORRECTED. DATA LOSS CAN OCCUR IN DIGITAL ECOSYSTEMS; CONSEQUENTLY, INSTITUTIONS ARE ADVISED TO KEEP INDEPENDENT BACKUPS OF CRITICAL RECORDS.
          </p>
        </>
      ),
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      content: (
        <>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL QEFAS HUB, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM.
          </p>
          <p className="mt-3">
            IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS EXCEED THE TOTAL FEES PAID BY YOU TO QEFAS HUB FOR THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM.
          </p>
        </>
      ),
    },
    {
      id: 'governing-law',
      title: '9. Governing Law and Jurisdiction',
      content: (
        <>
          <p>
            These Terms and any dispute arising out of your use of the Platform shall be governed by and construed in accordance with the laws of the country where our headquarters are located, without regard to its conflict of law principles.
          </p>
          <p className="mt-3">
            You agree to submit to the personal and exclusive jurisdiction of the competent courts located therein to resolve any legal disputes or actions.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: '10. Changes to Terms',
      content: (
        <>
          <p>
            We reserve the right to revise or update these Terms of Service at any time. If a revision is material, we will provide at least 30 days&rsquo; notice prior to any new terms taking effect by displaying a notice on our site or by sending an email.
          </p>
          <p className="mt-3">
            By continuing to access or use the Platform after those revisions become effective, you agree to be bound by the updated Terms.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 py-16 md:py-24 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Decorative ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden opacity-50 dark:opacity-20">
          <div className="absolute top-[-20%] left-[20%] w-[40%] aspect-square rounded-full bg-indigo-400/20 blur-[120px]" />
          <div className="absolute top-[-10%] right-[20%] w-[30%] aspect-square rounded-full bg-blue-400/20 blur-[120px]" />
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            Legal Agreement
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Please read these terms carefully before accessing or using Qefas Hub.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            <span>Last Updated: June 4, 2026</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-800" />
            <span>Version 2.1</span>
          </div>
        </div>

        {/* Layout Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
          {/* Side Navigation for Desktop */}
          <div className="hidden lg:block lg:col-span-1 sticky top-28 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <Link
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  {sec.title}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-6 pt-6 text-xs font-bold text-slate-400 dark:text-slate-500">
              Need help? <br />
              <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Contact Legal Support
              </Link>
            </div>
          </div>

          {/* Legal Content Body */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/30 px-6 py-10 md:px-12 md:py-14 rounded-3xl shadow-sm space-y-12">
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
              <p className="text-base font-semibold leading-relaxed mb-8 border-l-4 border-indigo-500 pl-4 bg-slate-50 dark:bg-slate-900/50 py-3 pr-3 rounded-r-xl">
                These Terms of Service govern your purchase and usage of the Qefas Hub school management platform and create a binding agreement. By accessing or using the systems, you accept these terms.
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-slate-100 dark:border-slate-800/50 pt-8 first:border-t-0 first:pt-0">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 space-y-4 font-medium">
                  {section.content}
                </div>
              </section>
            ))}

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
              © {new Date().getFullYear()} Qefas Hub. All rights reserved. Registered under global educational platform directives.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
