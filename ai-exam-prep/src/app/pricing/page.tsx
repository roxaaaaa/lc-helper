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
              Don't Just Study Harder, Study Smarter
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mt-4">
              Join thousands of students who've improved their exam scores with AI-powered practice. 
            <span className="font-semibold text-indigo-600"> No contracts. Cancel anytime.</span>
            </p>
            <div className="mt-6 flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-sm text-green-700 font-medium">
                  🎯 Trusted by 5,000+ students preparing for their Leaving Cert
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Trial Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col border-2 border-gray-100 hover:border-indigo-200 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-1">€0</p>
              <p className="text-gray-500 text-sm">7 days • No card required</p>
            </div>
            
            <div className="flex-1">
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>10 AI questions per week</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Full access to all features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No card needed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Risk-free trial experience</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/auth/signup" 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col border-2 border-indigo-200 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-1">€9.99</p>
              <p className="text-gray-500 text-sm">per month • Cancel anytime</p>
              <p className="text-indigo-600 text-sm font-medium mt-1">Just 33¢ per day!</p>
            </div>
            
            <div className="flex-1">
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Unlimited AI questions</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced marking scheme feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Detailed progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support & updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Perfect for flexible study schedules</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/auth/signup" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              Upgrade Now
            </Link>
          </div>

          {/* Exam Bundle Plan */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-xl p-8 flex flex-col border-2 border-indigo-500 relative">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                ⭐ BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exam Season Bundle</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-1">€24.99</p>
              <p className="text-gray-500 text-sm">3 months • One-time payment</p>
              <p className="text-green-600 text-sm font-bold mt-1">Save €5 vs monthly!</p>
            </div>
            
            <div className="flex-1">
              <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-200">
                <p className="text-sm text-indigo-700 font-medium text-center">
                  🎯 Perfect for intensive exam prep
                </p>
              </div>
              
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Everything in Monthly plan</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Covers entire exam season</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No auto-renewal worries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Limited-time student offer</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/auth/signup" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all transform hover:scale-105"
            >
              Get Bundle & Save
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Students Choose LC Helper</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-sm text-gray-600 text-center">Average 15% score improvement</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-gray-600 text-center">Instant AI feedback on every question</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm text-gray-600 text-center">Targeted practice for weak areas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgency CTA */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-orange-800 mb-2">⏰ Exams Are Coming!</h3>
            <p className="text-orange-700 mb-4">
              Don't waste time with ineffective study methods. Start your AI-powered exam prep today.
            </p>
            <Link 
              href="/auth/signup" 
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              TRY FOR FREE NOW
            </Link>
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