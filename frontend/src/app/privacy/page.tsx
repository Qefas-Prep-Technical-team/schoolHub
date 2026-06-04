import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qefas Hub',
  description: 'Privacy Policy describing how Qefas Hub collects, protects, and handles institutional and personal data.',
};

export default function PrivacyPolicy() {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction and Roles',
      content: (
        <>
          <p>
            At Qefas Hub, we are committed to protecting the privacy of educational institutions, administrators, teachers, students, and parents. This Privacy Policy describes how we collect, use, store, and share personal information through our platform.
          </p>
          <p className="mt-3">
            <strong>Data Controller vs. Data Processor:</strong> For the purposes of student educational records and institutional data uploaded by schools, the school or educational institution is the Data Controller. Qefas Hub acts strictly as the Data Processor, handling student data solely under the direct instructions and authorization of the subscribing school.
          </p>
        </>
      ),
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: (
        <>
          <p>
            We collect information that you provide directly, as well as data automatically generated during your interactions with the Platform.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Account Profile Data:</strong> Names, email addresses, phone numbers, role categories (Admin, Teacher, Student, Parent), and passwords.</li>
            <li><strong>Academic and Administrative Records:</strong> Gradebooks, assignments, attendance logs, exam schedules, class lists, and general school performance metrics uploaded by school staff.</li>
            <li><strong>Uploaded Media and Documents:</strong> Homework files, student avatars, and documents uploaded for analysis (such as exams uploaded for automated AI grade sheet scanning).</li>
            <li><strong>Payment Information:</strong> Billing details and subscription tokens. Payment processing is handled by third-party processors (such as Paystack). We do not store raw card numbers on our servers.</li>
            <li><strong>Technical and Usage Data:</strong> IP addresses, browser types, device information, access times, and cookies to manage active login sessions and verify security tokens.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'how-we-use-data',
      title: '3. How We Use Your Information',
      content: (
        <>
          <p>
            We process personal and institutional data for the following legitimate business and educational purposes:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>To operate, maintain, and provide the core functions of the Platform.</li>
            <li>To process exam files, recognize grading patterns via OCR/AI scanners, and generate performance analysis charts for schools.</li>
            <li>To manage subscriptions, issue invoices, and complete secure billing updates.</li>
            <li>To send critical system notifications, security updates, and transaction alerts.</li>
            <li>To verify user identity, prevent unauthorized portal access, and detect fraudulent activities.</li>
            <li>To provide technical and customer support.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'data-sharing',
      title: '4. How Information Is Shared',
      content: (
        <>
          <p>
            We do not sell, rent, or trade personal data to third parties for marketing or advertising. Data is only shared under the following conditions:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Within the School Ecosystem:</strong> Student grades, attendance, and performance logs are visible to authorized administrators, teachers, and their designated parents.</li>
            <li><strong>With Trusted Service Providers:</strong> We share data with hosting services, email delivery services, database backup systems, and billing providers who are contractually bound to protect the data.</li>
            <li><strong>Legal Obligations:</strong> We may disclose information if required to do so by law, court order, or governmental authorities to comply with safety and legal obligations.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'student-privacy',
      title: '5. Student Privacy Compliance (COPPA & FERPA)',
      content: (
        <>
          <p>
            Because our Platform is utilized by schools to manage student information, we adhere strictly to student privacy standards:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>FERPA Compliance:</strong> We act as a &ldquo;school official&rdquo; under the Family Educational Rights and Privacy Act (FERPA). School Data remains under the direct control of the school administration, and we process it only for authorized educational activities.</li>
            <li><strong>COPPA Compliance:</strong> We rely on the school to obtain parental consent before students under the age of 13 utilize the Platform. We do not gather personal data from minors for commercial marketing.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'data-security',
      title: '6. Data Security and Encryption',
      content: (
        <>
          <p>
            We employ industry-standard administrative, physical, and technical safeguards to keep personal and institutional data secure:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Encryption:</strong> All network traffic between your device and the Platform is encrypted using Secure Socket Layer (SSL/TLS) protocols. Databases containing sensitive credentials, gradebooks, and records are encrypted at rest.</li>
            <li><strong>Access Control:</strong> Administrative access is restricted to verified personnel only. We utilize strict token verification middleware to confirm access rights for all portal routes.</li>
            <li><strong>Backup Mechanisms:</strong> Automatic incremental backups are conducted frequently and stored in secure, geographically redundant cloud instances to prevent data loss.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention-deletion',
      title: '7. Data Retention and Deletion',
      content: (
        <>
          <p>
            We store School Data for as long as the school maintains an active subscription with Qefas Hub.
          </p>
          <p className="mt-3">
            If a school cancels its account, we will retain the data for a standard grace period of 90 days to prevent accidental loss, after which the database records, uploaded papers, and account links will be permanently deleted or anonymized from our live servers, subject to backup rotation cycle latency.
          </p>
        </>
      ),
    },
    {
      id: 'user-rights',
      title: '8. User Rights and Choices',
      content: (
        <>
          <p>
            Users are entitled to rights concerning their personal details:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Access and Correction:</strong> Parents, teachers, and administrators can review and edit their account profile settings directly through the portal dashboards.</li>
            <li><strong>Data Portability:</strong> Schools can export their grades, rosters, and schedules in common formats (e.g., PDF, XLSX) directly from their portal settings.</li>
            <li><strong>Student Records Deletion:</strong> Requests to delete student accounts or modify academic records must be directed to the school administrator. As the processor, we cannot alter school records without official administrative request.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      title: '9. Policy Modifications',
      content: (
        <>
          <p>
            We may update this Privacy Policy from time to time. When changes are made, we will adjust the &ldquo;Last Updated&rdquo; date at the top of this page. 
          </p>
          <p className="mt-3">
            For material changes affecting student data processing, we will provide additional notice or require re-consent via school administrators.
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
          <div className="absolute top-[-20%] left-[20%] w-[40%] aspect-square rounded-full bg-emerald-400/20 blur-[120px]" />
          <div className="absolute top-[-10%] right-[20%] w-[30%] aspect-square rounded-full bg-indigo-400/20 blur-[120px]" />
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
            Security & Trust
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Your data trust is our highest priority. Learn how we manage, protect, and process educational information.
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
                  className="block py-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                  {sec.title}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-6 pt-6 text-xs font-bold text-slate-400 dark:text-slate-500">
              Questions? <br />
              <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                Contact Privacy Team
              </Link>
            </div>
          </div>

          {/* Legal Content Body */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/30 px-6 py-10 md:px-12 md:py-14 rounded-3xl shadow-sm space-y-12">
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
              <p className="text-base font-semibold leading-relaxed mb-8 border-l-4 border-emerald-500 pl-4 bg-slate-50 dark:bg-slate-900/50 py-3 pr-3 rounded-r-xl">
                This policy outlines our strict commitments under standard privacy regulations including FERPA, COPPA, and regional educational guidelines. Qefas Hub only processes personal details to perform contracted educational operations.
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
              © {new Date().getFullYear()} Qefas Hub. All rights reserved. Data storage complies with international educational processing mandates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
