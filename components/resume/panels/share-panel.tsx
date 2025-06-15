import React, { useState, useCallback } from 'react';
import { Lock, ChevronDown, Link2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePanelProps {
  resumeId: string;
  className?: string;
}

type AccessLevel = 'no-access' | 'can-view' | 'can-edit';

const SharePanel: React.FC<SharePanelProps> = ({ resumeId, className = '' }) => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('no-access');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customLinkEnabled, setCustomLinkEnabled] = useState(false);
  const { toast } = useToast();

  const shareLink = `app.rezi.ai/s/${resumeId}`;

  const handleCopyLink = useCallback(() => {
    if (accessLevel === 'no-access') {
      toast({
        title: "Enable sharing first",
        description: "Change access level to 'can view' to share this resume",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(`https://${shareLink}`);
    toast({
      title: "Link copied!",
      description: "Resume link has been copied to clipboard",
    });
  }, [shareLink, accessLevel, toast]);

  const handleAccessChange = (newLevel: AccessLevel) => {
    setAccessLevel(newLevel);
    setShowDropdown(false);
    
    if (newLevel !== 'no-access') {
      toast({
        title: "Sharing enabled",
        description: `Anyone with the link ${newLevel}`,
      });
    } else {
      toast({
        title: "Sharing disabled",
        description: "Resume is now private",
      });
    }
  };

  const accessLevelText = {
    'no-access': 'no access',
    'can-view': 'can view',
    'can-edit': 'can edit'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex w-full flex-col gap-5">
        {/* Header with toggle */}
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share this resume</h3>
          <ChevronRight className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        {/* Access Control */}
        <div className="flex flex-row flex-wrap justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <Lock className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            <p className="text-base leading-6 text-gray-900 dark:text-gray-100">Anyone with the link</p>
          </div>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex cursor-pointer items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
            >
              <p className={`text-base leading-6 ${
                accessLevel === 'no-access' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {accessLevelText[accessLevel]}
              </p>
              <ChevronDown className={`w-4 h-4 ${
                accessLevel === 'no-access' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'
              }`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                {Object.entries(accessLevelText).map(([level, text]) => (
                  <button
                    key={level}
                    onClick={() => handleAccessChange(level as AccessLevel)}
                    className={`w-full text-left px-4 py-2 text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${level === 'no-access' ? 'rounded-t-lg' : level === 'can-edit' ? 'rounded-b-lg' : ''}
                      ${accessLevel === level ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
                    `}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            {/* Share Link Input */}
            <div className="flex flex-col gap-1">
              <div className={`h-10 flex items-center border-2 rounded-lg transition-all duration-200
                ${accessLevel === 'no-access' 
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <span className="px-3 font-semibold whitespace-nowrap text-gray-600 dark:text-gray-400">
                  app.rezi.ai/s/
                </span>
                <input
                  type="text"
                  value={resumeId}
                  disabled
                  className="bg-transparent text-gray-900 dark:text-gray-100 h-full w-full px-1 text-base font-semibold focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  disabled={accessLevel === 'no-access'}
                  className={`h-full px-3 transition-colors ${
                    accessLevel === 'no-access'
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                  }`}
                  title="Copy link"
                >
                  <Link2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Custom Link Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-base text-gray-900 dark:text-gray-100">Custom link</p>
                <div className="flex h-6 items-center rounded-full bg-gray-200 dark:bg-gray-700 px-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  PRO
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={() => setCustomLinkEnabled(!customLinkEnabled)}
                disabled
                className={`relative w-9 h-[1.125rem] rounded-full transition-all duration-200 cursor-not-allowed
                  ${customLinkEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div className={`absolute w-3 h-3 bg-white rounded-full transition-all duration-200 top-[0.19rem]
                  ${customLinkEnabled ? 'left-[1.31rem]' : 'left-[0.19rem]'}
                `} />
              </button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {accessLevel === 'no-access' 
                ? "Enable sharing to let others view your resume with this link."
                : accessLevel === 'can-view'
                ? "Anyone with this link can view your resume. They won't be able to make changes."
                : "Anyone with this link can view and suggest edits to your resume."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePanel;