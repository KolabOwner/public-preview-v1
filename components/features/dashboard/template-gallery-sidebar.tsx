'use client';
import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  Lock,
  AlertCircle,
  Star,
  CheckCircle2,
  Zap,
  Download,
  FileText,
  Award,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/shared/button";
import { RESUME_TEMPLATES } from "../resume/templates/resume-templates";
import { useSubscription } from "@/lib/client/hooks/auth/use-subscription";
import UpgradeModal from "../resume/modals/upgrade-modal";
import Image from "next/image";
import {
  TemplateErrorHandler,
  TemplateErrorRecovery,
  SubscriptionError,
  TemplateError
} from "@/lib/client/utils/template-errors";
import { DocumentSettingsClient } from "@/lib/client/services/resume/document-settings-client";
export interface TemplateGallerySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateChange?: (template: string) => Promise<void> | void;
  selectedTemplate?: string;
  disabled?: boolean;
  resumeId?: string;
}
// Template image mapping
const TEMPLATE_IMAGES: Record<string, string> = {
  modern: "/images/templates/ModernTemplate.png",
  professional: "/images/templates/creative-1.png",
  creative: "/images/templates/BoldTemplate.png",
  minimal: "/images/templates/CompactTemplate.png",
  executive: "/images/templates/AlternativeTemplate.png",
  academic: "/images/templates/creative-1.png",
  technical: "/images/templates/ModernTemplate.png",
  bold: "/images/templates/BoldTemplate.png"
};
// Featured/Recommended templates (most popular ones)
const RECOMMENDED_TEMPLATE_IDS = ["professional", "modern", "minimal", "bold"];
// Get recommended and other templates from the actual template data
const RECOMMENDED_TEMPLATES = RECOMMENDED_TEMPLATE_IDS.map(id => RESUME_TEMPLATES[id]).filter(Boolean);
const OTHER_TEMPLATE = RESUME_TEMPLATES["executive"]; // Just show the Alternative/Executive template
const TemplateCard = memo<{
  template: any;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  canAccess: boolean;
  disabled: boolean;
  isLoading: boolean;
  delay?: number;
}>(({ template, isSelected, onSelect, canAccess, disabled, isLoading, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-corporate-gold-500 shadow-xl shadow-corporate-gold-500/20 scale-105'
          : 'border-corporate-navy-200 hover:border-corporate-gold-300 hover:shadow-lg'
      }`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <h3 className="font-bold text-corporate-navy-900 text-lg">
                  {template.name}
                </h3>
                {!canAccess && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 rounded-full flex items-center justify-center">
                      <Lock size={12} className="text-corporate-navy-900" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-corporate-navy-900 px-3 py-1 rounded-full text-xs font-bold"
              >
                <CheckCircle2 size={14} />
                ACTIVE
              </motion.div>
            )}
          </div>
          <p className="text-corporate-navy-600 text-sm leading-relaxed mb-4">
            {template.description}
          </p>
          {/* Features */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-corporate-gold-600" />
              <span className="text-xs text-corporate-navy-700 font-medium">ATS Optimized</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-corporate-gold-600" />
              <span className="text-xs text-corporate-navy-700 font-medium">Professional</span>
            </div>
          </div>
        </div>
        {/* Template Preview */}
        <div className="px-6 pb-4">
          <button
            onClick={() => onSelect(template.id)}
            disabled={disabled || isLoading}
            className="w-full bg-gradient-to-br from-corporate-navy-50 to-white border border-corporate-navy-200 rounded-xl overflow-hidden hover:border-corporate-gold-300 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group relative"
          >
            <div className="relative h-[400px] w-full">
              <Image
                src={TEMPLATE_IMAGES[template.id] || "/images/templates/creative-1.png"}
                alt={`${template.name} Template Preview`}
                fill
                className="object-contain object-top transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 600px) 100vw, 600px"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-corporate-navy-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <ArrowRight className="w-6 h-6 text-corporate-navy-900" />
                </div>
              </div>
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 border-4 border-corporate-gold-500 rounded-xl pointer-events-none"
                />
              )}
              {/* Premium badge for locked templates */}
              {!canAccess && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-corporate-navy-900 px-2 py-1 rounded-full text-xs font-bold">
                  PRO
                </div>
              )}
            </div>
          </button>
        </div>
        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => onSelect(template.id)}
              disabled={disabled || isLoading}
              size="sm"
              className="flex-1 bg-corporate-navy-100 hover:bg-corporate-navy-200 text-corporate-navy-900 text-xs font-medium border-0"
            >
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button
              onClick={() => onSelect(template.id)}
              disabled={disabled || isLoading}
              size="sm"
              className="flex-1 bg-corporate-navy-100 hover:bg-corporate-navy-200 text-corporate-navy-900 text-xs font-medium border-0"
            >
              <Download className="w-3 h-3 mr-1" />
              DOCX
            </Button>
            <Button
              onClick={() => onSelect(template.id)}
              disabled={disabled || isLoading}
              size="sm"
              className="flex-1 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-600 hover:to-corporate-amber-600 text-corporate-navy-900 text-xs font-medium border-0"
            >
              <Star className="w-3 h-3 mr-1" />
              USE
            </Button>
          </div>
        </div>
        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-corporate-gold-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-corporate-navy-700">Applying template...</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
TemplateCard.displayName = "TemplateCard";
const TemplateGallerySidebar = memo<TemplateGallerySidebarProps>(({
  isOpen,
  onClose,
  onTemplateChange,
  selectedTemplate = "professional",
  disabled = false,
  resumeId
}) => {
  const [activeTab, setActiveTab] = useState<"recommended" | "other">("recommended");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscription, canAccessTemplate } = useSubscription();
  const handleTemplateSelect = useCallback(async (templateId: string) => {
    if (!onTemplateChange || disabled || isLoading) return;
    // Clear any previous errors
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
    // Use safe template operation wrapper
    const result = await TemplateErrorHandler.safeTemplateOperation(
      async () => {
        setIsLoading(true);
        console.log(`Applying template: ${template.name}`, {
          templateId,
          category: template.category,
          hasCustomColors: template.styles.colors.primary !== '#000000',
          hasDecorations: template.styles.decorations.useShadows || template.styles.decorations.useRoundedCorners,
        });
        // Apply template
        await onTemplateChange(templateId);
        // Template persistence is now handled by the useResumeStyles hook
        // so we don't need to duplicate the Firestore save here
      },
      templateId,
      'template_gallery_selection'
    );
    // Handle result
    if (TemplateErrorHandler.validateOperationResult(result)) {
      setError(null);
    } else {
      // Handle error with recovery
      const { error: templateError } = result;
      const userMessage = TemplateErrorRecovery.getUserFriendlyMessage(templateError);
      setError(userMessage);
      // Attempt recovery for critical errors
      if (templateError instanceof TemplateError && templateError.code === 'TEMPLATE_APPLICATION_ERROR') {
        const recovery = await TemplateErrorRecovery.recoverFromTemplateError(templateError);
        if (recovery.recovered && recovery.templateId !== templateId) {
          console.log(`Attempting recovery with template: ${recovery.templateId}`);
          // Could attempt to apply fallback template here
        }
      }
      // Log detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Template selection failed:', {
          templateId,
          error: templateError,
          suggestedActions: TemplateErrorRecovery.getSuggestedActions(templateError)
        });
      }
    }
    setIsLoading(false);
  }, [onTemplateChange, disabled, isLoading, canAccessTemplate]);
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ x: 600, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 600, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-full w-[700px] bg-gradient-to-br from-corporate-navy-50 via-white to-corporate-gold-50 shadow-2xl z-50 flex flex-col border-l border-corporate-navy-200/50"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-corporate-gold-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-corporate-amber-400/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-grid-black opacity-[0.02]"></div>
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-8 border-b border-corporate-navy-200/50 bg-white/80 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-corporate-navy-900 mb-1">
            Resume Templates
          </h2>
          <p className="text-corporate-navy-600 text-sm">
            Choose your perfect professional format
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-corporate-navy-600 hover:bg-corporate-navy-100 hover:text-corporate-navy-900 rounded-full w-10 h-10"
          aria-label="Close template gallery"
        >
          <X size={20} />
        </Button>
      </div>
      {/* Tab Navigation */}
      <div className="relative z-10 flex bg-white/60 backdrop-blur-sm border-b border-corporate-navy-200/50">
        <button
          onClick={() => setActiveTab("recommended")}
          className={`flex-1 py-4 px-8 text-sm font-semibold transition-all duration-300 relative ${
            activeTab === "recommended"
              ? "text-corporate-navy-900"
              : "text-corporate-navy-500 hover:text-corporate-navy-700"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Star className="w-4 h-4" />
            RECOMMENDED
          </div>
          {activeTab === "recommended" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500"
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("other")}
          className={`flex-1 py-4 px-8 text-sm font-semibold transition-all duration-300 relative ${
            activeTab === "other"
              ? "text-corporate-navy-900"
              : "text-corporate-navy-500 hover:text-corporate-navy-700"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            EXECUTIVE
          </div>
          {activeTab === "other" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500"
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
            className="relative z-10 mx-8 mt-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-semibold mb-1">Template Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors rounded-full p-1 hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "recommended" ? (
              <motion.div
                key="recommended"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {RECOMMENDED_TEMPLATES.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={handleTemplateSelect}
                    canAccess={canAccessTemplate(template.id)}
                    disabled={disabled}
                    isLoading={isLoading}
                    delay={index * 0.1}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <TemplateCard
                  template={OTHER_TEMPLATE}
                  isSelected={selectedTemplate === OTHER_TEMPLATE.id}
                  onSelect={handleTemplateSelect}
                  canAccess={canAccessTemplate(OTHER_TEMPLATE.id)}
                  disabled={disabled}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Chat Support Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 right-6 z-20"
      >
        <Button
          size="icon"
          className="bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-600 hover:to-corporate-amber-600 text-corporate-navy-900 rounded-full w-14 h-14 shadow-xl shadow-corporate-gold-500/25 border-2 border-white/50"
          aria-label="Chat support"
        >
          <MessageCircle size={24} />
        </Button>
      </motion.div>
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </motion.div>
  );
});
TemplateGallerySidebar.displayName = "TemplateGallerySidebar";
export default TemplateGallerySidebar;
