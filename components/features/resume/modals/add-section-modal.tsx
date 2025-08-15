'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionCreate?: (sectionName: string) => Promise<void>;
}

export default function AddSectionModal({ isOpen, onOpenChange, onSectionCreate }: AddSectionModalProps) {
  const [sectionName, setSectionName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const onClose = () => {
    // Reset state when closing
    setSectionName('');
    setError('');
    setIsCreating(false);
    onOpenChange(false);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSectionName('');
      setError('');
      setIsCreating(false);
    }
  }, [isOpen]);

  // Early return if modal is not open
  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!sectionName.trim()) {
      setError('Please enter a section name');
      return;
    }

    if (sectionName.trim().length > 50) {
      setError('Section name must be 50 characters or less');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Call the callback to handle section creation
      if (onSectionCreate) {
        await onSectionCreate(sectionName.trim());
      }
      onClose();
    } catch (err: any) {
      console.error('Error creating section:', err);
      setError(err.message || 'Failed to create section');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative transform rounded-lg border border-slate-200 dark:border-corporate-navy-600 text-left align-middle shadow-2xl transition-all w-full max-w-md bg-white dark:bg-corporate-navy-800">
        {/* Header */}
        <h2 className="flex leading-7 text-xl font-semibold bg-slate-50 dark:bg-corporate-navy-900 rounded-t-lg text-corporate-navy-900 dark:text-white items-center px-6 py-5 border-b border-slate-200 dark:border-corporate-navy-600">
          <div className="grow font-semibold">Create a resume section</div>
          <button 
            className="absolute right-6 flex h-8 w-8 items-center justify-center text-slate-500 dark:text-gray-400 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </h2>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="relative grid content-baseline gap-y-1">
            <div className="inline-block">
              <div className="flex items-end justify-between">
                <label 
                  role="group" 
                  htmlFor="section-name-input" 
                  className="uppercase flex items-center text-corporate-navy-700 dark:text-gray-300 font-medium"
                >
                  <span className="cursor-default text-sm leading-5">Section name</span>
                  <span className="cursor-default text-sm leading-5 ml-1 text-red-500">*</span>
                </label>
                <div id="undefined-portal-root" className="flex-shrink-0"></div>
              </div>
            </div>
            
            <div className="flex flex-row items-center">
              <div className="flex w-full flex-col gap-1">
                <div className="h-10 sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded transition-all duration-200 border-slate-300 dark:border-corporate-navy-600 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400 px-3 py-1 bg-white dark:bg-corporate-navy-700 gap-1">
                  <input
                    autoComplete="off"
                    className="bg-transparent text-corporate-navy-900 dark:text-white h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    name="section-name-input"
                    placeholder="Enter here..."
                    id="section-name-input"
                    required
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-x-4 justify-end rounded-b-lg px-6 py-4 border-t border-slate-200 dark:border-corporate-navy-600 bg-slate-50 dark:bg-corporate-navy-900">
          <button
            type="button"
            onClick={onClose}
            className="relative flex items-center justify-center font-bold uppercase px-4 py-2 min-h-10 leading-4 rounded-md text-xs text-corporate-navy-600 dark:text-gray-300 hover:text-corporate-navy-800 dark:hover:text-white bg-white dark:bg-corporate-navy-700 border border-slate-300 dark:border-corporate-navy-600 hover:border-slate-400 dark:hover:border-corporate-navy-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-corporate-amber-500/20"
          >
            <span className="px-1">Cancel</span>
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!sectionName.trim() || isCreating}
            className={`relative flex items-center justify-center font-bold uppercase px-4 py-2 min-h-10 leading-4 rounded-md text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-corporate-amber-500/20 ${
              sectionName.trim() && !isCreating
                ? 'bg-corporate-amber-600 hover:bg-corporate-amber-700 text-white shadow-md shadow-corporate-gold-500/30'
                : 'bg-slate-200 dark:bg-corporate-navy-700 text-slate-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="px-1">{isCreating ? 'Creating...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}