'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditSectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSectionUpdate?: (newName: string) => Promise<void>;
}

export default function EditSectionModal({ 
  isOpen, 
  onOpenChange, 
  currentName,
  onSectionUpdate 
}: EditSectionModalProps) {
  const [sectionName, setSectionName] = useState(currentName);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const onClose = () => {
    // Reset state when closing
    setSectionName(currentName);
    setError('');
    setIsUpdating(false);
    onOpenChange(false);
  };

  // Update section name when currentName changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSectionName(currentName);
      setError('');
      setIsUpdating(false);
    }
  }, [isOpen, currentName]);

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

    if (sectionName.trim() === currentName) {
      onClose();
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      if (onSectionUpdate) {
        await onSectionUpdate(sectionName.trim());
      }
      onClose();
    } catch (err: any) {
      console.error('Error updating section:', err);
      setError(err.message || 'Failed to update section');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative transform rounded-lg border border-surface-2-stroke text-left align-middle shadow-xl transition-all w-full max-w-md bg-surface-2">
        {/* Header */}
        <h2 className="flex leading-7 text-xl font-semibold bg-surface-2-1 rounded-t-lg text-gray-900 items-center px-6 py-6 border-b border-surface-2-stroke">
          <div className="grow font-semibold">Change section name</div>
          <div 
            className="absolute right-6 flex h-12 w-12 cursor-pointer items-center justify-end text-xl text-gray-900 hover:text-rezi-blue-500"
            onClick={onClose}
          >
            <i className="fas fa-close" aria-hidden="true"></i>
          </div>
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
                  htmlFor="section-name-edit" 
                  className="uppercase flex items-center text-gray-900 font-normal"
                >
                  <span className="cursor-default text-sm leading-5">Section name</span>
                  <span className="cursor-default text-sm leading-5 ml-1"> *</span>
                </label>
                <div id="undefined-portal-root" className="flex-shrink-0"></div>
              </div>
            </div>
            
            <div className="flex flex-row items-center">
              <div className="flex w-full flex-col gap-1">
                <div className="h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded group-[.company-found]:rounded-b-none rounded transition-all duration-200 group-[.company-found]:border-purple-200 border-input-stroke px-3 py-1 focus:ring-0 bg-input-bg gap-1">
                  <input
                    autoComplete="off"
                    className="bg-input-bg text-gray-900 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-300 text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    name="section-name-edit"
                    placeholder="Enter here..."
                    id="section-name-edit"
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
        <div className="flex gap-x-4 justify-end rounded-b-lg px-6 py-4 border-t border-surface-2-stroke">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 disabled:bg-input-bg-disabled disabled:text-input-disabled disabled:cursor-not-allowed bg-surface-2 disabled:text-input-disabled disabled:bg-transparent disabled:border-input-disabled disabled:border text-gray-900 border-solid border border-button-secondary-stroke focus:bg-button-secondary-hover active:bg-button-secondary-active hover:bg-button-secondary-hover px-2 py-1 min-h-8 leading-4 rounded-md text-xs"
          >
            <span className="px-1">Cancel</span>
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!sectionName.trim() || isUpdating}
            className={`relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 disabled:bg-input-bg-disabled disabled:text-input-disabled disabled:cursor-not-allowed border-0 px-2 py-1 min-h-8 leading-4 rounded-md text-xs ${
              sectionName.trim() && !isUpdating
                ? 'bg-rezi-blue-600 active:bg-rezi-blue-700 focus:bg-rezi-blue-500 text-white hover:bg-rezi-blue-500'
                : 'bg-input-bg-disabled text-input-disabled cursor-not-allowed'
            }`}
          >
            <span className="px-1">{isUpdating ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}