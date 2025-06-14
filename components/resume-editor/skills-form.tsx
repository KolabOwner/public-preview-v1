'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Save, Loader2, Info, PlusCircle, Trash2, ListChecks, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface SkillEntry {
  id: string;
  category: string;
  keywords: string;
}

interface SkillsFormProps {
  initialData: SkillEntry[];
  onSave: (data: SkillEntry[]) => void;
}

export default function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const processedData = initialData.map(skill => ({ ...skill }));
    setSkillEntries(processedData.length > 0 ? processedData : [{ id: `skill-${Date.now()}`, category: '', keywords: '' }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const validateEntry = (entry: SkillEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.category.trim()) entryErrors.category = "Skill category is required.";
    if (!entry.keywords.trim()) entryErrors.keywords = "Keywords are required for this category.";
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    // Filter out entries that are completely empty before validation
    const filledEntries = skillEntries.filter(entry => entry.category.trim() || entry.keywords.trim());

    filledEntries.forEach((entry, idx) => {
      const entryErrors = validateEntry(entry);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
        // Find original index to correctly highlight error if current view matches
        const originalIndex = skillEntries.findIndex(se => se.id === entry.id);
        if (originalIndex === currentEntryIndex) formIsValid = false;
      }
    });
    setErrors(newErrors);
    const allEntriesValid = filledEntries.every(entry => Object.keys(validateEntry(entry)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };


  const handleInputChange = (field: keyof SkillEntry, value: string) => {
    setSkillEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  const addSkillEntry = () => {
    const newId = `skill-${Date.now()}`;
    const newEntry: SkillEntry = { id: newId, category: '', keywords: '' };
    setSkillEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(skillEntries.length);
  };

  const removeCurrentSkillEntry = () => {
    if (skillEntries.length <= 1) {
        setSkillEntries([{ id: `skill-${Date.now()}`, category: '', keywords: '' }]);
        setCurrentEntryIndex(0);
        setErrors({});
        return;
    }
    const entryIdToRemove = skillEntries[currentEntryIndex].id;
    setSkillEntries(prev => prev.filter(exp => exp.id !== entryIdToRemove));
    setCurrentEntryIndex(prev => Math.max(0, prev - 1));
    setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[entryIdToRemove];
        return newErrors;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { allFormsValid } = validateAllEntries();

    // Allow saving if all *filled* entries are valid. Empty entries are filtered out.
    if (!allFormsValid) {
         const firstErrorEntryIndex = skillEntries.findIndex(entry => {
            if (!entry.category.trim() && !entry.keywords.trim()) return false; // Skip empty
            return Object.keys(validateEntry(entry)).length > 0;
        });
        if (firstErrorEntryIndex !== -1) {
            setCurrentEntryIndex(firstErrorEntryIndex);
             toast({
                title: "Validation Error",
                description: "Please correct the errors in the skill entries.",
                variant: "destructive",
            });
        } else if (skillEntries.some(entry => (entry.category.trim() && !entry.keywords.trim()) || (!entry.category.trim() && entry.keywords.trim()))) {
             toast({
                title: "Incomplete Entry",
                description: "A skill category requires keywords, and keywords require a category.",
                variant: "destructive",
            });
        }
        setIsSaving(false);
        return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const validEntries = skillEntries.filter(entry => entry.category.trim() && entry.keywords.trim());
    onSave(validEntries);
    setIsSaving(false);
     toast({
      title: "Skills Section Saved",
      description: "Your skills have been updated.",
    });
  };

  const currentEntry = skillEntries[currentEntryIndex];

   if (!currentEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading skills data or no entries available.
        <Button onClick={addSkillEntry} variant="outline" className="mt-4">Add First Skill Category</Button>
      </div>
    );
  }
  const entryErrors = (errors[currentEntry.id] as Record<string, string>) || {};
  const navigationHeaderTitle = currentEntry.category || "New Skill Category";


  return (
    <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <Palette className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
            {navigationHeaderTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {skillEntries.length}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(skillEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === skillEntries.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentSkillEntry}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} id="skillsForm" className="space-y-4 sm:space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor={`category-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHICH <span className="font-bold">CATEGORY</span> OF SKILLS? <span className="text-red-500">*</span></Label>
            <Input
              id={`category-${currentEntry.id}`}
              value={currentEntry.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g., Programming Languages, Design Tools"
              className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.category ? "border-destructive" : "")}
            />
            {entryErrors.category && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.category}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`keywords-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT <span className="font-bold">SKILLS</span> ARE IN THIS CATEGORY? <span className="text-red-500">*</span></Label>
            <Textarea
              id={`keywords-${currentEntry.id}`}
              value={currentEntry.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js OR Figma, Adobe XD, Sketch"
              rows={5}
              className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.keywords ? "border-destructive" : "")}
            />
            {entryErrors.keywords && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.keywords}</p>}
            <p className="text-xs text-muted-foreground flex items-center">
              <Info size={14} className="mr-1.5"/>
              Enter skills separated by commas or on new lines.
            </p>
          </div>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
        <Button type="button" variant="ghost" onClick={addSkillEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Skill Category
        </Button>
        <Button type="submit" form="skillsForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Skills Section
        </Button>
      </div>
    </div>
  );
}