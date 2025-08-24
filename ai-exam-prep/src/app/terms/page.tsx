'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">These are placeholder terms. Replace with your real Terms of Service.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the platform responsibly.</li>
          <li>Respect intellectual property and privacy.</li>
          <li>We may update these terms periodically.</li>
        </ul>
        <div className="mt-6">
          <Link href="/landing" className="text-indigo-600 hover:text-indigo-500">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

