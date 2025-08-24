'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">This is a placeholder privacy policy. Replace with your real policy.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We store only necessary user information.</li>
          <li>We do not sell your data.</li>
          <li>You can request deletion of your data.</li>
        </ul>
        <div className="mt-6">
          <Link href="/landing" className="text-indigo-600 hover:text-indigo-500">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

