// components/resume-editor/certifications-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Award, Save, Loader2, Plus, X, ChevronLeft, ChevronRight, AlertCircle, Calendar } from "lucide-react";

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface CertificationsFormProps {
  initialData: CertificationEntry[];
  onSave: (data: CertificationEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function CertificationsForm({ initialData, onSave, autoSave = false }: CertificationsFormProps) {
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize certifications
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setCertifications(initialData);
    } else {
      setCertifications([{
        id: `cert-${Date.now()}`,
        name: '',
        issuer: '',
        date: '',
        description: ''
      }]);
    }
    setCurrentIndex(0);
  }, [initialData]);

  const currentCert = certifications[currentIndex];
  if (!currentCert) return null;

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!currentCert.name.trim()) errs.add('name');
    if (!currentCert.issuer.trim()) errs.add('issuer');
    if (!currentCert.date.trim()) errs.add('date');

    setErrors(errs);
    return errs.size === 0;
  };

  const updateField = (field: keyof CertificationEntry, value: string) => {
    setCertifications(prev => prev.map((cert, i) =>
      i === currentIndex ? { ...cert, [field]: value } : cert
    ));

    // Clear field error
    if (errors.has(field)) {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Filter out empty certifications and save
      const validCertifications = certifications.filter(cert =>
        cert.name.trim() && cert.issuer.trim() && cert.date.trim()
      );
      await onSave(validCertifications);
      showNotification('Certifications saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save certifications', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addCertification = () => {
    const newCert: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      description: ''
    };
    setCertifications(prev => [...prev, newCert]);
    setCurrentIndex(certifications.length);
  };

  const removeCertification = () => {
    if (certifications.length <= 1) return;
    setCertifications(prev => prev.filter((_, i) => i !== currentIndex));
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const navigateToIndex = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, certifications.length - 1)));
  };

  const headerTitle = currentCert.name || `Certification ${currentIndex + 1}`;

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            {headerTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {currentIndex + 1} / {certifications.length}
            </span>
            <button
              onClick={() => navigateToIndex(currentIndex + 1)}
              disabled={currentIndex === certifications.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {certifications.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-300 dark:bg-[#3a4452] mx-1" />
                <button
                  onClick={removeCertification}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Certificate Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHAT IS THE <span className="font-bold">CERTIFICATE NAME</span>? <span className="text-red-500">*</span>
          </label>
          <input
            value={currentCert.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Project Management Professional (PMP)"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${errors.has('name') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {errors.has('name') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Issuing Organization */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            <span className="font-bold">WHO</span> ISSUED THE CERTIFICATE? <span className="text-red-500">*</span>
          </label>
          <input
            value={currentCert.issuer}
            onChange={(e) => updateField('issuer', e.target.value)}
            placeholder="Project Management Institute"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${errors.has('issuer') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {errors.has('issuer') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Date Issued */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            <span className="font-bold">WHEN</span> WAS IT ISSUED? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={currentCert.date}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="2025"
              className={`
                w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${errors.has('date') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
          </div>
          {errors.has('date') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            HOW IS THIS CERTIFICATE <span className="font-bold">RELEVANT</span>?
          </label>
          <textarea
            value={currentCert.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Certified in a standardized and evolving set of project management principles..."
            rows={4}
            className="
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none
              transition-colors
            "
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-t border-gray-200 dark:border-[#1e252f] flex justify-between items-center">
        <button
          onClick={addCertification}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Certificate
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-6 py-2.5
            bg-blue-600 hover:bg-blue-700 text-white
            rounded-md font-medium text-sm uppercase tracking-wide
            transition-all
            ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              SAVE TO CERTIFICATIONS LIST
            </>
          )}
        </button>
      </div>

      {/* Toast */}
      {showToast.show && (
        <div className={`
          fixed bottom-4 right-4 px-3 py-2 rounded-md shadow-lg text-white text-sm
          transform transition-all duration-300 z-50
          ${showToast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}
        `}>
          {showToast.message}
        </div>
      )}
    </div>
  );
}