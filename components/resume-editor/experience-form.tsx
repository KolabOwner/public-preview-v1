'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Briefcase, Save, Loader2, Info, PlusCircle, Trash2, ChevronLeft, ChevronRight, AlertCircle, Calendar } from "lucide-react";
import { useToast } from '@/components/hooks/use-toast';
import { cn } from '../utils';

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // For backward compatibility
  bulletPoints: string[]; // Primary storage for bullet points
}

interface ExperienceFormProps {
  initialData: ExperienceEntry[];
  onSave: (data: ExperienceEntry[]) => void;
}

export default function ExperienceForm({ initialData, onSave }: ExperienceFormProps) {
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const processedData = initialData.map(exp => {
      // Transform data from older formats
      if (!exp.bulletPoints) {
        // Check for descriptionPoints first (from our previous attempt)
        if (exp.descriptionPoints) {
          return {
            ...exp,
            bulletPoints: exp.descriptionPoints,
            description: exp.description // keep original for backward compatibility
          };
        }
        // Otherwise try to parse from the description field
        else if (exp.description) {
          // Extract bullet points if they exist
          let bulletPoints: string[] = [];
          const cleanDescription = exp.description.trim();

          if (cleanDescription.includes('\n•') || cleanDescription.includes('\n-')) {
            // Parse bullet points from description text
            bulletPoints = exp.description
              .split(/\n[•\-]\s?/)
              .map(line => line.trim())
              .filter(Boolean);
          } else {
            // Just use the whole description as a single bullet point
            bulletPoints = cleanDescription ? [cleanDescription] : [];
          }

          return {
            ...exp,
            bulletPoints,
            description: exp.description // keep original
          };
        }
      }
      return { ...exp };
    });

    setExperienceEntries(processedData.length > 0 ? processedData : [{
      id: `exp-${Date.now()}`,
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bulletPoints: []
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const validateEntry = (entry: ExperienceEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.company.trim()) entryErrors.company = "Company name is required.";
    if (!entry.title.trim()) entryErrors.title = "Job title is required.";
    if (!entry.startDate.trim()) entryErrors.startDate = "Start date is required.";
    if (!entry.current && !entry.endDate.trim()) entryErrors.endDate = "End date is required when not current.";
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    // Filter out entries that are completely empty before validation
    const filledEntries = experienceEntries.filter(entry => 
      entry.company.trim() || entry.title.trim() || entry.location.trim() || 
      entry.startDate.trim() || entry.endDate.trim() || entry.description.trim()
    );

    filledEntries.forEach((entry) => {
      const entryErrors = validateEntry(entry);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
        // Find original index to correctly highlight error if current view matches
        const originalIndex = experienceEntries.findIndex(exp => exp.id === entry.id);
        if (originalIndex === currentEntryIndex) formIsValid = false;
      }
    });
    setErrors(newErrors);
    const allEntriesValid = filledEntries.every(entry => Object.keys(validateEntry(entry)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };

  const handleInputChange = (field: keyof ExperienceEntry, value: any) => {
    setExperienceEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));

    // Clear error when field is corrected
    if (errors[experienceEntries[currentEntryIndex]?.id]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[experienceEntries[currentEntryIndex].id][field];
      if (Object.keys(updatedErrors[experienceEntries[currentEntryIndex].id]).length === 0) {
        delete updatedErrors[experienceEntries[currentEntryIndex].id];
      }
      setErrors(updatedErrors);
    }
  };

  const addExperienceEntry = () => {
    const newId = `exp-${Date.now()}`;
    const newEntry: ExperienceEntry = {
      id: newId,
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bulletPoints: []
    };
    setExperienceEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(experienceEntries.length);
  };

  const addBulletPoint = (newPoint: string = "") => {
    setExperienceEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        const updatedPoints = [...(entry.bulletPoints || []), newPoint];
        // Also update description field for backward compatibility
        const updatedDescription = updatedPoints.map(p => `• ${p}`).join('\n');
        return {
          ...entry,
          bulletPoints: updatedPoints,
          description: updatedDescription
        };
      }
      return entry;
    }));
  };

  const formatSentencesWithNewlines = (text: string): string => {
    // Don't modify empty strings
    if (!text.trim()) return text;

    // Replace periods followed by a space and capital letter with period and newline
    // But avoid breaking common abbreviations like "e.g." or "i.e."
    const formattedText = text
      .replace(/(?<!\b[A-Za-z]\.)(?<!\b[A-Za-z][A-Za-z]\.)(?<=\.|\?|\!) +(?=[A-Z])/g, '. \n');

    return formattedText;
  };

  const handleBulletPointChange = (index: number, value: string) => {
    setExperienceEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        const points = [...(entry.bulletPoints || [])];

        // Check if there are multiple sentences (using regex to find sentence endings)
        const sentences = value.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim());

        if (sentences.length > 1) {
          // If we detect multiple sentences, split them into separate bullet points

          // First, update the current bullet point with just the first sentence
          if(index < points.length) {
            points[index] = sentences[0];
          } else {
            points.push(sentences[0]);
          }

          // Then add the remaining sentences as new bullet points
          sentences.slice(1).forEach(sentence => {
            points.push(sentence);
          });
        } else {
          // Just a single sentence, handle normally
          if(index < points.length) {
            points[index] = value;
          } else {
            points.push(value);
          }
        }

        // Filter out empty points except the one being edited
        const filteredPoints = points.filter((p, i) => p.trim() !== '' || i === index);

        // Also update description field for backward compatibility
        const updatedDescription = filteredPoints.map(p => `• ${p}`).join('\n');

        return {
          ...entry,
          bulletPoints: filteredPoints,
          description: updatedDescription
        };
      }
      return entry;
    }));
  };

  const removeBulletPoint = (index: number) => {
    setExperienceEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        const points = [...(entry.bulletPoints || [])];
        points.splice(index, 1);

        // Also update description field for backward compatibility
        const updatedDescription = points.map(p => `• ${p}`).join('\n');

        return {
          ...entry,
          bulletPoints: points,
          description: updatedDescription
        };
      }
      return entry;
    }));
  };

  const removeCurrentExperienceEntry = () => {
    if (experienceEntries.length <= 1) {
      setExperienceEntries([{
        id: `exp-${Date.now()}`,
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        bulletPoints: []
      }]);
      setCurrentEntryIndex(0);
      setErrors({});
      return;
    }
    const entryIdToRemove = experienceEntries[currentEntryIndex].id;
    setExperienceEntries(prev => prev.filter(exp => exp.id !== entryIdToRemove));
    setCurrentEntryIndex(prev => Math.max(0, prev - 1));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[entryIdToRemove];
      return newErrors;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { allFormsValid } = validateAllEntries();

    if (!allFormsValid) {
      const firstErrorEntryIndex = experienceEntries.findIndex(entry => {
        // Skip completely empty entries
        if (!entry.company.trim() && !entry.title.trim() && !entry.location.trim() &&
          !entry.startDate.trim() && !entry.endDate.trim() && !entry.description.trim()) {
          return false;
        }
        return Object.keys(validateEntry(entry)).length > 0;
      });
      if (firstErrorEntryIndex !== -1) {
        setCurrentEntryIndex(firstErrorEntryIndex);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the experience entries.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const validEntries = experienceEntries.filter(entry => 
      entry.company.trim() && entry.title.trim() && entry.startDate.trim() && 
      (entry.current || entry.endDate.trim())
    );
    onSave(validEntries);
    setIsSaving(false);
    toast({
      title: "Experience Section Saved",
      description: "Your experience information has been updated.",
    });
  };

  const currentEntry = experienceEntries[currentEntryIndex];

  if (!currentEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading experience data or no entries available.
        <Button onClick={addExperienceEntry} variant="outline" className="mt-4">Add First Experience</Button>
      </div>
    );
  }
  
  const entryErrors = errors[currentEntry.id] || {};
  const navigationHeaderTitle = currentEntry.title 
    ? `${currentEntry.title} at ${currentEntry.company}` 
    : currentEntry.company || "New Experience";

  return (
    <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
            {navigationHeaderTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {experienceEntries.length}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(experienceEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === experienceEntries.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentExperienceEntry}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} id="experienceForm" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`company-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">COMPANY / ORGANIZATION <span className="text-red-500">*</span></Label>
              <Input
                id={`company-${currentEntry.id}`}
                value={currentEntry.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Acme Corporation"
                className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.company ? "border-destructive" : "")}
              />
              {entryErrors.company && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.company}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`title-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">JOB TITLE <span className="text-red-500">*</span></Label>
              <Input
                id={`title-${currentEntry.id}`}
                value={currentEntry.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.title ? "border-destructive" : "")}
              />
              {entryErrors.title && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.title}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`location-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">LOCATION</Label>
              <Input
                id={`location-${currentEntry.id}`}
                value={currentEntry.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA"
                className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`startDate-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">START DATE <span className="text-red-500">*</span></Label>
                <Input
                  id={`startDate-${currentEntry.id}`}
                  value={currentEntry.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="e.g., May 2020"
                  className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.startDate ? "border-destructive" : "")}
                />
                {entryErrors.startDate && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`endDate-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">END DATE {!currentEntry.current && <span className="text-red-500">*</span>}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`current-${currentEntry.id}`}
                      checked={currentEntry.current}
                      onCheckedChange={(checked) => {
                        handleInputChange('current', checked);
                        if (checked) {
                          handleInputChange('endDate', 'Present');
                        } else if (currentEntry.endDate === 'Present') {
                          handleInputChange('endDate', '');
                        }
                      }}
                    />
                    <Label htmlFor={`current-${currentEntry.id}`} className="text-xs">Current</Label>
                  </div>
                </div>
                <Input
                  id={`endDate-${currentEntry.id}`}
                  value={currentEntry.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder={currentEntry.current ? "Present" : "e.g., June 2023"}
                  disabled={currentEntry.current}
                  className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", 
                    entryErrors.endDate ? "border-destructive" : "",
                    currentEntry.current ? "opacity-50" : ""
                  )}
                />
                {entryErrors.endDate && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.endDate}</p>}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-semibold">RESPONSIBILITIES & ACHIEVEMENTS</Label>

            <div className="py-2">

              {(!currentEntry.bulletPoints || currentEntry.bulletPoints.length === 0) ? (
                <div className="p-4 border border-dashed border-border/60 rounded-lg text-center text-muted-foreground text-sm">
                  <p>No bullet points added yet.</p>
                  <p>Use the "Add Bullet Point" button below to add your achievements.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentEntry.bulletPoints.map((point, index) => (
                    <div key={index} className="group bg-background/30 dark:bg-background/10 hover:bg-background/50 dark:hover:bg-background/20 rounded-md border border-border/60 transition-colors duration-100">
                      <div className="flex items-start p-3">
                        <div className="flex-shrink-0 w-6 pt-2 text-primary font-bold">•</div>
                        <div className="flex-grow">
                          <Textarea
                            value={point}
                            onChange={(e) => handleBulletPointChange(index, e.target.value)}
                            placeholder="Describe one specific responsibility or achievement..."
                            className="min-h-[80px] w-full resize-y border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBulletPoint(index)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Button type="button" variant="ghost" onClick={addExperienceEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Experience
          </Button>
          <Button type="button" variant="ghost" onClick={() => addBulletPoint('')} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Bullet Point
          </Button>
        </div>
        <Button type="submit" form="experienceForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Experience Section
        </Button>
      </div>
    </div>
  );
}