"use client";

import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { useState } from 'react';

export default function DebugLaTeXPage() {
  const [text, setText] = useState('1. Single Backslash: $\\frac{15}{3}$ \n\n 2. Double Backslash: $\\\\frac{15}{3}$ \n\n 3. No Delimiter: \\frac{15}{3}');

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">LaTeX Backslash Debug</h1>
      
      <div className="space-y-4">
        <textarea 
          className="w-full h-32 p-4 border rounded font-mono text-sm dark:bg-slate-800"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-bold">Rendered Output:</h2>
        <div className="p-8 border rounded bg-white dark:bg-slate-900 shadow-inner">
          <LaTeXRenderer content={text} />
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 rounded text-xs">
        <p>Raw string being passed to LaTeXRenderer:</p>
        <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
          {JSON.stringify(text)}
        </pre>
      </div>
    </div>
  );
}
