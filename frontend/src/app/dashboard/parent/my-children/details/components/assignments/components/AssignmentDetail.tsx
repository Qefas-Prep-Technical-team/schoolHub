'use client'

import Image from 'next/image'
import { Beaker, Clock,Printer as Print, Share, Upload, Download, FileText,File as FilePdf } from 'lucide-react'
import { useState } from 'react'

export default function AssignmentDetail() {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    setIsUploading(true)
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="lg:col-span-7 lg:sticky lg:top-0">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
        {/* Header Image */}
        <div className="h-32 bg-cover bg-center relative" style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCbzmyTaGBl9aNPCkRtgmwulnV4HKgyyOH4fPJWKYSAkQP33z5ZuG1Rq9qyb0WtO8WBuHhact-zy4EW87MX_SmUqlaO2ZrrBia_ycQg7fhXgAbYDKu_MemCQts84b-fCkGN6D8OuG-EqTu_8ss1S_Mb7twx-HATJ88v4QG1ocfcnfdk8bgoCb1WsSzrZf5FPsokuqZOc-DqJldmGGQrKJ08saYJM5noPHH43yB5s1NoeJn9gryEiRrnrrC0vC7t2QERBIEpYsG1tfU)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent"></div>
        </div>

        <div className="px-8 pb-8 -mt-12 relative">
          {/* Header Actions */}
          <div className="flex justify-between items-end mb-4">
            <div className="bg-surface-light dark:bg-surface-dark p-2 rounded-xl shadow-sm inline-block">
              <div className="size-14 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Beaker className="size-8" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted hover:text-primary transition-colors"
                title="Print Details"
              >
                <Print className="size-5" />
              </button>
              <button
                className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted hover:text-primary transition-colors"
                title="Share"
              >
                <Share className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Title Block */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded">
                  Science • Mr. Anderson
                </span>
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 tracking-wider uppercase bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded flex items-center gap-1">
                  <span className="size-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  Pending
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white leading-tight mb-2">
                Volcano Model Project
              </h1>
              <p className="text-text-muted flex items-center gap-2">
                <Clock className="size-5" />
                Due Thursday, Oct 24, 2023 at 11:59 PM
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none text-text-main dark:text-slate-300 text-sm leading-relaxed">
              <p>
                Build a working model of a volcano using household items. Your model must demonstrate a chemical reaction that simulates an eruption. Please document your process with photos.
              </p>
              <p className="font-bold mt-4 mb-2">Requirements:</p>
              <ul className="list-disc pl-5 space-y-1 text-text-muted">
                <li>Base needs to be at least 10x10 inches.</li>
                <li>Include a written explanation (1 page) of the chemical reaction.</li>
                <li>Safety first: Wear goggles during the experiment.</li>
              </ul>
            </div>

            {/* Attachments */}
            <div>
              <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider mb-3">
                Teacher Attachments
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group w-full sm:w-auto"
                >
                  <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                    <FilePdf className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary">
                      Project_Rubric.pdf
                    </span>
                    <span className="text-xs text-text-muted">2.4 MB</span>
                  </div>
                  <Download className="text-text-muted group-hover:text-primary ml-auto sm:ml-4 size-5" />
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group w-full sm:w-auto"
                >
                  <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary">
                      Safety_Guidelines.docx
                    </span>
                    <span className="text-xs text-text-muted">1.1 MB</span>
                  </div>
                  <Download className="text-text-muted group-hover:text-primary ml-auto sm:ml-4 size-5" />
                </a>
              </div>
            </div>

            {/* Submission Area */}
            <div className="bg-background-light dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">
                    Your Submission
                  </h4>
                  <p className="text-xs text-text-muted">
                    Status: <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      Not Submitted Yet
                    </span>
                  </p>
                </div>
                <span className="material-symbols-outlined text-text-muted text-3xl">cloud_upload</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="size-5" />
                  {isUploading ? 'Uploading...' : 'Upload Assignment'}
                </button>
                <p className="text-center text-xs text-text-muted">
                  Supported formats: PDF, JPG, PNG, DOCX (Max 20MB)
                </p>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="opacity-60 grayscale cursor-not-allowed select-none relative">
              <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider mb-3">
                Teacher Feedback
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-4">
                <div className="relative size-10 shrink-0">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfWtyAo8guPbpfyraKMpcjEJfmDN87DMB8-RAtFMwyZjCL2WZba5jCOLngaDLvsYv6UQLP__REd3WvrcBncFh3hCuahQZoG_0WMQP94IRI-qHsTBUzf9hY-hCIWviJTh8q-TnBm0ezWhSGzI_exg0etP8wGdJSsZajOL9PuhtWY85uiBYzLCaM1OySoobE7C7tlC65XjGzvRUAxyzFe9m4Wih8bSoRxsgHeaMhe6lK2bz5o03Gn8dtgrViISB9v_fgwxKIKqznJA0"
                    alt="Teacher Mr. Anderson"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-bold text-text-main dark:text-white">Mr. Anderson</span>
                    <span className="text-xs text-text-muted">--/--/----</span>
                  </div>
                  <p className="text-sm text-text-muted italic">
                    Feedback will appear here once graded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}