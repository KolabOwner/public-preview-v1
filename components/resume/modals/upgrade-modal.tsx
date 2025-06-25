'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  savings: string | null;
}

interface Feature {
  text: string;
  note?: string;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: (planId: string) => Promise<void>;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [currency, setCurrency] = useState<string>('USD');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      if (onUpgrade) {
        await onUpgrade(selectedPlan);
      } else {
        // Default behavior if no onUpgrade handler provided
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 29.00,
      period: '/mo',
      savings: null
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: 19.00,
      period: '/mo',
      savings: '34%'
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 149.00,
      period: '/once',
      savings: null
    }
  ];

  const features: (string | Feature)[] = [
    'Unlimited AI Writer Use',
    'Unlimited Resumes, Cover Letters, Resignation Letters',
    'Unlimited Keyword Targeting, Content Analysis',
    { text: '1 Free Monthly Resume Review', note: '(unavailable on Pro Lifetime)' },
    'All other features'
  ];

  const additionalFeatures: string[] = [
    'All resume templates',
    'All Pro Samples',
    'Add resume photo',
    'Download as Microsoft .DOCX',
    'Add to Google Drive'
  ];

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(var(--tw-rotate));
          }
          50% {
            transform: translateY(-20px) rotate(var(--tw-rotate));
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay-1 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-delay-2 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-gray-600">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors group"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-gray-300 group-hover:text-slate-800 dark:group-hover:text-gray-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left Visual Section */}
              <div className="relative w-full lg:w-[400px] h-[300px] lg:h-[620px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
                {/* Grid pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`
                  }}
                />

                {/* Animated gradient orbs */}
                <div className="absolute inset-0">
                  <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-20 right-10 w-56 h-56 bg-teal-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Floating document cards */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Document 1 */}
                    <div className="absolute top-24 left-12 w-32 h-40 bg-white/10 backdrop-blur-md rounded-lg shadow-xl rotate-6 animate-float">
                      <div className="p-3 space-y-2">
                        <div className="h-2 bg-emerald-400/50 rounded" />
                        <div className="h-2 bg-emerald-400/30 rounded w-4/5" />
                        <div className="h-2 bg-emerald-400/30 rounded w-3/5" />
                        <div className="mt-4 space-y-1">
                          <div className="h-1.5 bg-emerald-400/20 rounded w-full" />
                          <div className="h-1.5 bg-emerald-400/20 rounded w-5/6" />
                          <div className="h-1.5 bg-emerald-400/20 rounded w-4/6" />
                        </div>
                      </div>
                    </div>

                    {/* Document 2 */}
                    <div className="absolute top-32 right-16 w-36 h-44 bg-white/15 backdrop-blur-md rounded-lg shadow-xl -rotate-3 animate-float-delay-1">
                      <div className="p-3 space-y-2">
                        <div className="h-2 bg-teal-400/50 rounded" />
                        <div className="h-2 bg-teal-400/30 rounded w-5/6" />
                        <div className="h-2 bg-teal-400/30 rounded w-4/6" />
                        <div className="h-2 bg-teal-400/30 rounded w-3/6" />
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="h-8 bg-teal-400/20 rounded" />
                          <div className="h-8 bg-teal-400/20 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Document 3 */}
                    <div className="absolute bottom-32 left-20 w-40 h-48 bg-white/20 backdrop-blur-md rounded-lg shadow-xl rotate-12 animate-float-delay-2">
                      <div className="p-4 space-y-3">
                        <div className="h-2 bg-cyan-400/50 rounded" />
                        <div className="h-2 bg-cyan-400/30 rounded w-4/5" />
                        <div className="h-2 bg-cyan-400/30 rounded w-3/5" />
                        <div className="h-2 bg-cyan-400/30 rounded w-5/6" />
                        <div className="mt-4 h-16 bg-cyan-400/10 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Center icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                        <div className="relative bg-gradient-to-r from-emerald-400 to-teal-400 p-4 rounded-2xl transform transition-transform group-hover:scale-110">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content Section */}
              <section className="flex flex-auto flex-col justify-between gap-y-6 p-6 lg:p-8">
                <div className="flex flex-col gap-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upgrade to Pro</h1>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-8 px-3 text-sm font-semibold text-slate-700 dark:text-gray-200 bg-slate-100 dark:bg-gray-700 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="USD">$ (USD)</option>
                      <option value="EUR">€ (EUR)</option>
                      <option value="GBP">£ (GBP)</option>
                      <option value="CAD">$ (CAD)</option>
                      <option value="AUD">$ (AUD)</option>
                    </select>
                  </div>

                  <p className="text-lg text-slate-600 dark:text-gray-300">
                    Upgrade your plan to get access to all the features.
                  </p>

                  {/* Features List */}
                  <div className="flex flex-col gap-y-3 mt-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="text-slate-700 dark:text-gray-300">
                          {typeof feature === 'string' ? feature : (
                            <>
                              {feature.text}
                              <span className="text-slate-500 dark:text-gray-400 text-sm ml-1">{feature.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Additional features tooltip */}
                    <div className="flex items-start gap-3 group relative">
                      <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 dark:text-gray-300">All other features</span>
                        <svg className="w-4 h-4 text-slate-400 dark:text-gray-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>

                        {/* Tooltip */}
                        <div className="absolute left-0 top-full mt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800 dark:bg-gray-700 text-white text-sm p-3 rounded-lg shadow-xl z-10 w-56 transform -translate-y-2 group-hover:translate-y-0">
                          <div className="absolute -top-2 left-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800 dark:border-b-gray-700" />
                          <ul className="list-disc list-inside space-y-1">
                            {additionalFeatures.map((feature, idx) => (
                              <li key={idx} className="text-slate-100 dark:text-gray-200">{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Plans */}
                  <div className="flex flex-col gap-3 mt-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedPlan === plan.id
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 ring-1 ring-slate-200 dark:ring-gray-600'
                        }`}
                      >
                        {/* Radio button */}
                        <div className="w-6 h-6">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedPlan === plan.id
                              ? 'border-emerald-500 bg-emerald-500 scale-110'
                              : 'border-slate-300 dark:border-gray-500 bg-white dark:bg-gray-600 hover:border-slate-400 dark:hover:border-gray-400'
                          }`}>
                            {selectedPlan === plan.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in-50" />
                            )}
                          </div>
                        </div>

                        {/* Plan details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900 dark:text-white">{plan.name}</span>
                            {plan.savings && (
                              <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full shadow-sm">
                                Save {plan.savings}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${plan.price.toFixed(2)}
                          </span>
                          <span className="text-slate-500 dark:text-gray-400 text-sm">{plan.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleContinue}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </div>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-gray-600">
                    <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Secure Payment
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">SSL Encrypted</span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">Cancel Anytime</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default UpgradeModal;