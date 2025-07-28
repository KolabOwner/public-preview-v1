

'use client';

import React, { useState, useCallback, memo, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  AlertCircle,
  Star,
  CheckCircle2,
  Download,
  FileText,
  Award,
  Crown
} from "lucide-react";
import { Button } from "@/components/shared/button";
import { RESUME_TEMPLATES } from "../resume/templates/resume-templates";
import { useSubscription } from "@/lib/client/hooks/auth/use-subscription";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic import for a heavy modal component
const UpgradeModal = dynamic(() => import("../resume/modals/upgrade-modal"), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading...</div>
});

export interface TemplateGallerySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateChange?: (template: string) => Promise<void> | void;
  selectedTemplate?: string;
  disabled?: boolean;
  resumeId?: string;
}

// Template image mapping - optimized for Next.js Image
const TEMPLATE_IMAGES: Record<string, string> = {
  modern: "/images/templates/ModernTemplate.png",
  professional: "/images/templates/StandardTemplate.png",
  creative: "/images/templates/BoldTemplate.png",
  minimal: "/images/templates/CompactTemplate.png",
  alternative: "/images/templates/AlternativeTemplate.png",
  academic: "/images/templates/creative-1.png",
  technical: "/images/templates/ModernTemplate.png",
  bold: "/images/templates/BoldTemplate.png"
} as const;

// Constants for better performance
const RECOMMENDED_TEMPLATE_IDS = ["professional", "modern", "minimal", "bold"] as const;

// Memoized template data
const getTemplateData = () => {
  const recommended = RECOMMENDED_TEMPLATE_IDS.map(id => RESUME_TEMPLATES[id]).filter(Boolean);
  const alternative = RESUME_TEMPLATES["alternative"];
  return { recommended, alternative };
};

// Optimized Template Card Component
const TemplateCard = memo<{
  template: any;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  canAccess: boolean;
  disabled: boolean;
  isLoading: boolean;
  delay?: number;
}>(({ template, isSelected, onSelect, canAccess, disabled, isLoading, delay = 0 }) => {
  const handleSelect = useCallback(() => {
    if (!disabled && !isLoading) {
      onSelect(template.id);
    }
  }, [disabled, isLoading, onSelect, template.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="group relative"
    >
      <div className={`
        relative overflow-hidden rounded-xl border transition-colors duration-200
        ${isSelected 
          ? 'border-blue-500 bg-slate-800/90 shadow-lg shadow-blue-500/20' 
          : 'border-slate-700 bg-slate-800/60'
        }
      `}>
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">
                {template.name}
              </h3>
              {!canAccess && (
                <div className="flex items-center">
                  <Crown size={14} className="text-amber-400" />
                </div>
              )}
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium"
              >
                <CheckCircle2 size={12} />
                SELECTED
              </motion.div>
            )}
          </div>


        </div>

        {/* Template Preview */}
        <div className="px-0 pb-2">
          <button
            onClick={handleSelect}
            disabled={disabled || isLoading}
            className="w-full relative overflow-hidden rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Select ${template.name} template`}
          >
            <div className="relative h-[40rem] w-full">
              <Suspense fallback={
                <div className="w-full h-full bg-slate-700 animate-pulse rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
              }>
                <Image
                  src={TEMPLATE_IMAGES[template.id] || "/images/templates/creative-1.png"}
                  alt={`${template.name} template preview`}
                  fill
                  className="object-contain object-top"
                  sizes="(max-width: 768px) 100vw, 576px"
                  quality={75}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBBEFITAxUWGRof/aAAwDAQACEQMRAD8A0XqaN2nQBVHAH0KAKT//2Q=="
                />
              </Suspense>

              {/* Premium badge */}
              {!canAccess && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-2 py-1 rounded-md text-xs font-bold">
                  PRO
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-2 pt-0">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleSelect}
              disabled={disabled || isLoading}
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white text-xs h-8"
            >
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button
              onClick={handleSelect}
              disabled={disabled || isLoading}
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white text-xs h-8"
            >
              <Download className="w-3 h-3 mr-1" />
              DOCX
            </Button>
            <Button
              onClick={handleSelect}
              disabled={disabled || isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-medium"
            >
              <Star className="w-3 h-3 mr-1" />
              USE
            </Button>
          </div>
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-slate-200">Applying...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

TemplateCard.displayName = "TemplateCard";

// Main Component
const TemplateGallerySidebar = memo<TemplateGallerySidebarProps>(({
  isOpen,
  onClose,
  onTemplateChange,
  selectedTemplate = "professional",
  disabled = false,
  resumeId
}) => {
  const [activeTab, setActiveTab] = useState<"recommended" | "alternative">("recommended");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subscription, canAccessTemplate } = useSubscription();

  // Memoize template data to prevent unnecessary re-renders
  const templateData = useMemo(() => getTemplateData(), []);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    if (!onTemplateChange || disabled || isLoading) return;

    setError(null);

    // Validate template exists
    const template = RESUME_TEMPLATES[templateId];
    if (!template) {
      const errorMessage = `Template "${templateId}" not found`;
      setError(errorMessage);
      console.error(errorMessage, { availableTemplates: Object.keys(RESUME_TEMPLATES) });
      return;
    }

    // Check subscription access
    if (!canAccessTemplate(templateId)) {
      if (templateId !== 'professional') {
        setShowUpgradeModal(true);
        return;
      }
    }

    // Apply template with error handling
    try {
      setIsLoading(true);
      console.log(`Applying template: ${template.name}`, {
        templateId,
        category: template.category,
      });

      await onTemplateChange(templateId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply template';
      setError(errorMessage);
      console.error('Template application failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onTemplateChange, disabled, isLoading, canAccessTemplate]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-1">
              Resume Template Gallery
            </h2>
            <p className="text-slate-400 text-sm">
              Choose your perfect format
            </p>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg w-9 h-9"
            aria-label="Close template gallery"
            disabled={isLoading}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-800/30 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 relative ${
              activeTab === "recommended"
                ? "text-blue-400 bg-slate-800/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              RECOMMENDED
            </div>
            {activeTab === "recommended" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("alternative")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 relative ${
              activeTab === "alternative"
                ? "text-blue-400 bg-slate-800/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4" />
              ALTERNATIVE
            </div>
            {activeTab === "alternative" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-300 text-sm font-medium mb-1">Template Error</p>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-200 transition-colors rounded p-1 hover:bg-red-800/30"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
          <div className="p-4 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === "recommended" ? (
                <motion.div
                  key="recommended"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {templateData.recommended.map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={handleTemplateSelect}
                      canAccess={canAccessTemplate(template.id)}
                      disabled={disabled}
                      isLoading={isLoading}
                      delay={index * 0.05}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="alternative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {templateData.alternative && (
                    <TemplateCard
                      template={templateData.alternative}
                      isSelected={selectedTemplate === templateData.alternative.id}
                      onSelect={handleTemplateSelect}
                      canAccess={canAccessTemplate(templateData.alternative.id)}
                      disabled={disabled}
                      isLoading={isLoading}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Need help? Contact support
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              aria-label="Chat support"
            >
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Modal - Dynamically loaded */}
      <Suspense fallback={null}>
        {showUpgradeModal && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
      </Suspense>
    </>
  );
});

TemplateGallerySidebar.displayName = "TemplateGallerySidebar";

export default TemplateGallerySidebar;
