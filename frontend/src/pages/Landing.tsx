import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Never Miss a Follow-Up",
      description: "Every lead gets a mandatory follow-up date. No lead is ever forgotten."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Agent Accountability",
      description: "Clear ownership. Every lead is assigned. Every action is tracked."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-Time Visibility",
      description: "Owners see everything. Know which leads are stuck. Know which agents need support."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "10-Second Updates",
      description: "Update a lead in under 10 seconds. Simple. Fast. Effective."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Complete History",
      description: "Every interaction is logged. Never lose context when leads are reassigned."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Daily Execution",
      description: "Built for daily use. The first screen shows who to call today. Every morning."
    }
  ];

  const stats = [
    { number: "100%", label: "Follow-Up Coverage" },
    { number: "10s", label: "Update Time" },
    { number: "0", label: "Lost Leads" },
    { number: "24/7", label: "Access" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#FAF9F6]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Real Estate CRM</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-gradient-to-b from-yellow-500 to-yellow-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6 animate-fade-in">
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold shadow-sm">
                🚀 Trusted by Real Estate Teams Worldwide
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              Never Lose a Lead
              <br />
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                Never Miss a Follow-Up
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              The daily execution tool that ensures every real estate lead is followed up on time, 
              every agent is accountable, and owners always have clear visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-b from-yellow-500 to-yellow-400 text-white font-bold rounded-xl text-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl text-lg border-2 border-gray-300 hover:border-yellow-400 hover:shadow-xl transition-all duration-200"
              >
                Login to Dashboard
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Real Estate Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple. Fast. Effective. Everything you need, nothing you don't.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-gray-200 bg-white"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 to-yellow-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about how we transform real estate lead management
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                question: "How is this different from other CRMs?",
                answer: "Unlike generic CRMs, we're built specifically for real estate daily execution. Every lead MUST have a follow-up date—no exceptions. Our 'Leads to Call Today' screen is the first thing agents see every morning, ensuring nothing falls through the cracks. We enforce discipline, not just track data."
              },
              {
                question: "What makes this system prevent lost leads?",
                answer: "Our mandatory follow-up date system ensures every lead has a next action. Combined with daily reminders, pending work alerts, and complete interaction history, agents can't forget a lead. The system tracks everything from first contact to closing, with automatic status updates and work item creation."
              },
              {
                question: "How fast can agents update leads?",
                answer: "Agents can update a lead in under 10 seconds. Our streamlined interface shows exactly what needs attention today, with one-click status updates, quick note additions, and instant follow-up date changes. No complex forms, no unnecessary fields—just fast, effective updates."
              },
              {
                question: "What visibility do owners get?",
                answer: "Owners see everything in real-time: which leads are stuck, which agents need support, pending follow-ups, site visits completed, deals closed, and agent performance metrics. The admin dashboard provides complete transparency without micromanagement, helping owners make data-driven decisions."
              },
              {
                question: "How does agent accountability work?",
                answer: "Every lead is assigned to a specific agent. Agents only see their own leads, creating clear ownership. All actions are tracked with timestamps. Owners can see per-agent statistics including leads generated, pending works, completion rates, and activity levels. This creates natural accountability without constant oversight."
              },
              {
                question: "What happens when a lead is reassigned?",
                answer: "When a lead is reassigned, the complete interaction history moves with it. Every note, every status change, every follow-up date is preserved. The new agent has full context immediately, preventing repeated calls and confusion. This seamless handoff ensures continuity."
              },
              {
                question: "How does the follow-up system work?",
                answer: "Every lead requires a follow-up date before it can be saved. The system automatically creates work items for each follow-up. Agents see 'Leads to Call Today' every morning. If a follow-up is missed, it appears in pending works with alerts. This ensures no lead is ever forgotten."
              },
              {
                question: "Can I track site visits and deals?",
                answer: "Absolutely! The system tracks site visits automatically when status is updated. Deals closed are counted when leads are marked as completed. The dashboard shows real-time metrics: total leads, follow-ups due today, site visits done this month, and deals closed. All data syncs instantly across the platform."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900 pr-4 flex items-start">
                    <span className="text-yellow-500 mr-2 text-base">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 pl-8">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Still have questions? Get in touch with our team.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-b from-yellow-500 to-yellow-400 text-white font-bold rounded-xl text-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Get Started Now</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Real Estate CRM</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 Real Estate CRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
