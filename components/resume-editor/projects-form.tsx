'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Code, Save, Loader2, Info, PlusCircle, Trash2, ChevronLeft, ChevronRight, AlertCircle, Link } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface ProjectEntry {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  url: string;
  description: string;
  technologies: string[];
}

interface ProjectsFormProps {
  initialData: ProjectEntry[];
  onSave: (data: ProjectEntry[]) => void;
}

export default function ProjectsForm({ initialData, onSave }: ProjectsFormProps) {
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const processedData = initialData.map(proj => {
      // Handle different data structures (from Firestore vs form)
      return {
        id: proj.id || `proj-${Date.now()}`,
        title: proj.title || "",
        organization: proj.organization || "",
        startDate: proj.startDate || "",
        endDate: proj.endDate || "",
        url: proj.url || "",
        description: proj.description || "",
        // Handle different technologies formats
        technologies: Array.isArray(proj.technologies) ? proj.technologies :
                     typeof proj.technologies === 'string' ? [proj.technologies] :
                     []
      };
    });

    setProjectEntries(processedData.length > 0 ? processedData : [{
      id: `proj-${Date.now()}`,
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      url: '',
      description: '',
      technologies: []
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const validateEntry = (entry: ProjectEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.title.trim()) entryErrors.title = "Project title is required.";
    
    // URL validation (if provided)
    if (entry.url.trim()) {
      try {
        new URL(entry.url);
      } catch (e) {
        entryErrors.url = "Please enter a valid URL (include https://).";
      }
    }
    
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    
    // Filter out entries that are completely empty before validation
    const filledEntries = projectEntries.filter(entry => 
      entry.title.trim() || entry.organization.trim() || entry.description.trim() ||
      entry.startDate.trim() || entry.endDate.trim() || entry.url.trim()
    );

    filledEntries.forEach((entry) => {
      const entryErrors = validateEntry(entry);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
        // Find original index to correctly highlight error if current view matches
        const originalIndex = projectEntries.findIndex(proj => proj.id === entry.id);
        if (originalIndex === currentEntryIndex) formIsValid = false;
      }
    });
    
    setErrors(newErrors);
    const allEntriesValid = filledEntries.every(entry => Object.keys(validateEntry(entry)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };

  const handleInputChange = (field: keyof ProjectEntry, value: any) => {
    setProjectEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));

    // Clear error when field is corrected
    if (errors[projectEntries[currentEntryIndex]?.id]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[projectEntries[currentEntryIndex].id][field];
      if (Object.keys(updatedErrors[projectEntries[currentEntryIndex].id]).length === 0) {
        delete updatedErrors[projectEntries[currentEntryIndex].id];
      }
      setErrors(updatedErrors);
    }
  };

  const handleTechnologiesChange = (value: string) => {
    // Parse comma-separated or line-separated technologies
    const techArray = value
      .split(/[,\n]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    handleInputChange('technologies', techArray);
  };

  const addProjectEntry = () => {
    const newId = `proj-${Date.now()}`;
    const newEntry: ProjectEntry = {
      id: newId,
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      url: '',
      description: '',
      technologies: []
    };
    setProjectEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(projectEntries.length);
  };

  const removeCurrentProjectEntry = () => {
    if (projectEntries.length <= 1) {
      setProjectEntries([{
        id: `proj-${Date.now()}`,
        title: '',
        organization: '',
        startDate: '',
        endDate: '',
        url: '',
        description: '',
        technologies: []
      }]);
      setCurrentEntryIndex(0);
      setErrors({});
      return;
    }
    
    const entryIdToRemove = projectEntries[currentEntryIndex].id;
    setProjectEntries(prev => prev.filter(proj => proj.id !== entryIdToRemove));
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
      const firstErrorEntryIndex = projectEntries.findIndex(entry => {
        // Skip completely empty entries
        if (!entry.title.trim() && !entry.organization.trim() && !entry.description.trim() &&
          !entry.startDate.trim() && !entry.endDate.trim() && !entry.url.trim()) {
          return false;
        }
        return Object.keys(validateEntry(entry)).length > 0;
      });
      
      if (firstErrorEntryIndex !== -1) {
        setCurrentEntryIndex(firstErrorEntryIndex);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the project entries.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const validEntries = projectEntries.filter(entry => entry.title.trim());
    onSave(validEntries);
    setIsSaving(false);
    toast({
      title: "Projects Section Saved",
      description: "Your projects information has been updated.",
    });
  };

  const currentEntry = projectEntries[currentEntryIndex];

  if (!currentEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading projects data or no entries available.
        <Button onClick={addProjectEntry} variant="outline" className="mt-4">Add First Project</Button>
      </div>
    );
  }
  
  const entryErrors = errors[currentEntry.id] || {};
  const navigationHeaderTitle = currentEntry.title || "New Project";

  return (
    <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <Code className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
            {navigationHeaderTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {projectEntries.length}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(projectEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === projectEntries.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentProjectEntry}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} id="projectsForm" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`title-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">PROJECT TITLE <span className="text-red-500">*</span></Label>
              <Input
                id={`title-${currentEntry.id}`}
                value={currentEntry.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., E-commerce Website"
                className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.title ? "border-destructive" : "")}
              />
              {entryErrors.title && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`organization-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">ORGANIZATION / TEAM</Label>
              <Input
                id={`organization-${currentEntry.id}`}
                value={currentEntry.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="e.g., Personal Project, Hackathon, University"
                className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`startDate-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">START DATE</Label>
                <Input
                  id={`startDate-${currentEntry.id}`}
                  value={currentEntry.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="e.g., May 2020"
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`endDate-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">END DATE</Label>
                <Input
                  id={`endDate-${currentEntry.id}`}
                  value={currentEntry.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder="e.g., June 2023 or Ongoing"
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`url-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">PROJECT URL</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id={`url-${currentEntry.id}`}
                  value={currentEntry.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com/project"
                  className={cn(
                    "bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background pl-9",
                    entryErrors.url ? "border-destructive" : ""
                  )}
                />
              </div>
              {entryErrors.url && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.url}</p>}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor={`description-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">PROJECT DESCRIPTION</Label>
            <Textarea
              id={`description-${currentEntry.id}`}
              value={currentEntry.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the project, your role, and key achievements..."
              rows={4}
              className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
            />
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info size={14} className="mr-1.5 shrink-0"/>
              Highlight the problem solved, your role, and the impact.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`technologies-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">TECHNOLOGIES USED</Label>
            <Textarea
              id={`technologies-${currentEntry.id}`}
              value={currentEntry.technologies.join(', ')}
              onChange={(e) => handleTechnologiesChange(e.target.value)}
              placeholder="React, Node.js, MongoDB, etc."
              rows={2}
              className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
            />
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info size={14} className="mr-1.5 shrink-0"/>
              Enter technologies separated by commas.
            </p>
          </div>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
        <Button type="button" variant="ghost" onClick={addProjectEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
        </Button>
        <Button type="submit" form="projectsForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Projects Section
        </Button>
      </div>
    </div>
  );
}