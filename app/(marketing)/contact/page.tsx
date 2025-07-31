'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Clock, CheckCircle2, AlertCircle, Send, User, FileText } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: z.enum(['technical', 'billing', 'general', 'feedback', 'bug'], {
    required_error: 'Please select a category'
  }),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

const ContactPage = () => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange'
  });

  const messageLength = watch('message')?.length || 0;

  const onSubmit = async (data: ContactFormData) => {
    setSubmissionState({ isSubmitting: true, isSuccess: false, error: null });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setSubmissionState({ isSubmitting: false, isSuccess: true, error: null });
      reset();
    } catch (error) {
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const supportFeatures = [
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'We typically respond within 24 hours during business days'
    },
    {
      icon: MessageCircle,
      title: 'Expert Support',
      description: 'Get help from our experienced technical support team'
    },
    {
      icon: CheckCircle2,
      title: 'Issue Resolution',
      description: 'We work with you until your issue is completely resolved'
    }
  ];

  const categories = [
    { value: 'technical', label: 'Technical Support', icon: '🔧' },
    { value: 'billing', label: 'Billing & Account', icon: '💳' },
    { value: 'general', label: 'General Inquiry', icon: '❓' },
    { value: 'feedback', label: 'Product Feedback', icon: '💡' },
    { value: 'bug', label: 'Report a Bug', icon: '🐛' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Simplified Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-corporate-navy-900 mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-corporate-navy-600">
              Send us a message and we&apos;ll respond within 24 hours
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="pb-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
              {submissionState.isSuccess ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-corporate-gold-100 to-corporate-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-corporate-gold-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-corporate-navy-900 mb-4">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-corporate-navy-600 mb-8">
                    Thank you for contacting us. We&apos;ve received your message and will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmissionState({ isSubmitting: false, isSuccess: false, error: null })}
                    className="bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-corporate-gold-600 hover:to-corporate-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error Message */}
                  {submissionState.error && (
                    <motion.div
                      className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl p-4 flex items-start gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800">Error sending message</h4>
                        <p className="text-red-700 text-sm">{submissionState.error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-5">
                    <div>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className={`w-full px-5 py-4 border-0 bg-corporate-navy-50/50 rounded-xl focus:ring-2 focus:ring-corporate-gold-500 focus:bg-white/90 transition-all placeholder-corporate-navy-400 text-corporate-navy-900 ${
                          errors.name ? 'ring-2 ring-red-400 bg-red-50/80' : ''
                        }`}
                        placeholder="Your name"
                        disabled={submissionState.isSubmitting}
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full px-5 py-4 border-0 bg-corporate-navy-50/50 rounded-xl focus:ring-2 focus:ring-corporate-gold-500 focus:bg-white/90 transition-all placeholder-corporate-navy-400 text-corporate-navy-900 ${
                          errors.email ? 'ring-2 ring-red-400 bg-red-50/80' : ''
                        }`}
                        placeholder="Your email address"
                        disabled={submissionState.isSubmitting}
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <select
                        {...register('category')}
                        id="category"
                        className={`w-full px-5 py-4 border-0 bg-corporate-navy-50/50 rounded-xl focus:ring-2 focus:ring-corporate-gold-500 focus:bg-white/90 transition-all text-corporate-navy-900 ${
                          errors.category ? 'ring-2 ring-red-400 bg-red-50/80' : ''
                        }`}
                        disabled={submissionState.isSubmitting}
                      >
                        <option value="" className="text-corporate-navy-400">How can we help?</option>
                        {categories.map((category) => (
                          <option key={category.value} value={category.value} className="text-corporate-navy-900">
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register('subject')}
                        type="text"
                        id="subject"
                        className={`w-full px-5 py-4 border-0 bg-corporate-navy-50/50 rounded-xl focus:ring-2 focus:ring-corporate-gold-500 focus:bg-white/90 transition-all placeholder-corporate-navy-400 text-corporate-navy-900 ${
                          errors.subject ? 'ring-2 ring-red-400 bg-red-50/80' : ''
                        }`}
                        placeholder="Subject"
                        disabled={submissionState.isSubmitting}
                      />
                      {errors.subject && (
                        <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={6}
                        className={`w-full px-5 py-4 border-0 bg-corporate-navy-50/50 rounded-xl focus:ring-2 focus:ring-corporate-gold-500 focus:bg-white/90 transition-all resize-none placeholder-corporate-navy-400 text-corporate-navy-900 ${
                          errors.message ? 'ring-2 ring-red-400 bg-red-50/80' : ''
                        }`}
                        placeholder="Tell us more about your inquiry..."
                        disabled={submissionState.isSubmitting}
                      />
                      <div className="flex justify-between items-center mt-2">
                        {errors.message && (
                          <p className="text-sm text-red-600">{errors.message.message}</p>
                        )}
                        <div className="text-sm text-corporate-navy-400 ml-auto">
                          {messageLength}/2000
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={submissionState.isSubmitting || !isValid}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        submissionState.isSubmitting || !isValid
                          ? 'bg-corporate-navy-100 text-corporate-navy-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white hover:from-corporate-gold-600 hover:to-corporate-amber-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {submissionState.isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-corporate-navy-400 border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;