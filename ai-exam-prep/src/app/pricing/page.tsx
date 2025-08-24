'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/landing" className="text-2xl font-bold text-indigo-600">LC Helper</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/landing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/pricing" className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              LC HELPER Pricing Plans
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mt-4">
              Flexible, affordable plans for students, teachers, and schools. No contracts. Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* Student Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">For Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter <span className="text-sm text-green-600">(Free Trial)</span></h3>
            <p className="text-3xl font-bold text-indigo-600 mb-2">€0</p>
            <ul className="mb-4 space-y-2 text-gray-700">
              <li>✅ 7-day full access</li>
              <li>✅ No credit card required</li>
              <li>✅ Try questions, dashboard & feedback</li>
            </ul>
            <Link href="/auth/signup" className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded text-center">Start Free Trial</Link>
          </div>
          {/* Pro Student Plan */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col border-2 border-indigo-500 relative">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro Student</h3>
            <p className="text-3xl font-bold text-indigo-600 mb-2">€9.99 <span className="text-base font-normal text-gray-500">/month</span></p>
            <p className="text-sm text-gray-500 mb-2">That's just 33 cents a day!</p>
            <ul className="mb-4 space-y-2 text-gray-700">
              <li>✅ Unlimited AI-generated questions</li>
              <li>✅ Marking scheme-based feedback</li>
              <li>✅ Personalized dashboard & topic tracking</li>
              <li>✅ New features & updates included</li>
              <li>✅ Cancel anytime</li>
            </ul>
            <Link href="/auth/signup" className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded text-center">Go Pro</Link>
          </div>
          {/* Exam Booster Plan */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Booster</h3>
            <p className="text-3xl font-bold text-indigo-600 mb-2">€24.99 <span className="text-base font-normal text-gray-500">/3 months</span></p>
            <p className="text-sm text-green-600 mb-2">Save 15% – perfect for focused prep closer to the exam</p>
            <ul className="mb-4 space-y-2 text-gray-700">
              <li>✅ Includes everything in Pro</li>
              <li>✅ One-time payment, no auto-renewal</li>
            </ul>
            <Link href="/auth/signup" className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded text-center">Boost My Prep</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <h3 className="text-2xl font-bold text-white">LC Helper</h3>
              <p className="text-gray-300 text-base">
                Your AI-powered companion for Leaving Certificate exam preparation.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/main" className="text-base text-gray-300 hover:text-white">
                        Study Tools
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-base text-gray-300 hover:text-white">
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/main" className="text-base text-gray-300 hover:text-white">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="/main" className="text-base text-gray-300 hover:text-white">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 LC Helper. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 