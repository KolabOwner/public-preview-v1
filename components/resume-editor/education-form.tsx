'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, CalendarIcon, PlusCircle, Trash2, Save, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  location?: string;
  date: Date | null;
  dateFormat?: string;
  isGraduate?: boolean;
  minor?: string;
  score?: string;
  scoreType?: string;
  details?: string;
}

interface EducationFormProps {
  initialData: EducationEntry[];
  onSave: (data: EducationEntry[]) => void;
}

const DATE_FORMAT_OPTIONS = ["YYYY", "MMMM YYYY", "MM/YYYY"];

export default function EducationForm({ initialData, onSave }: EducationFormProps) {
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
     const processedData = initialData.map(edu => {
      // Handle different data structures (from Firestore vs form)
      const parsedEntry: EducationEntry = {
        id: edu.id || `edu-${Date.now()}`,
        // Map from Firestore format first, then use form format as fallback
        institution: edu.institution || edu.school || "",
        qualification: edu.qualification || edu.degree || edu.rms_education_0_qualification || "",
        location: edu.location || "",
        minor: edu.minor || edu.fieldOfStudy || "",
        score: edu.score || edu.gpa || "",
        scoreType: edu.scoreType || edu.gpaScale || "",
        details: edu.details || edu.description || "",
        isGraduate: edu.isGraduate !== undefined ? edu.isGraduate : true,
        dateFormat: edu.dateFormat || "MMMM YYYY",
        date: null // Will be set below
      };

      // Handle date parsing based on the source data
      if (edu.date) {
        // If it's already a Date object, use it
        if (edu.date instanceof Date) {
          parsedEntry.date = edu.date;
        } else if (typeof edu.date === 'string') {
          try {
            parsedEntry.date = parseISO(edu.date);
          } catch (error) {
            console.error('Error parsing date string:', error);
          }
        }
      } else if (edu.endDate) {
        // If there's no date field but there is an endDate (Firestore format)
        try {
          parsedEntry.date = typeof edu.endDate === 'string' ? parseISO(edu.endDate) : null;
        } catch (error) {
          console.error('Error parsing endDate string:', error);
          // If we can't parse it as a date, at least store the string value
          parsedEntry.date = typeof edu.endDate === 'string' ? new Date() : null;
        }
      }

      return parsedEntry;
    });

    setEducationEntries(processedData.length > 0 ? processedData : [{
      id: `edu-${Date.now()}`,
      institution: "", qualification: "", date: null, dateFormat: "MMMM YYYY", isGraduate: true,
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);


  const validateEntry = (entry: EducationEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.institution.trim()) entryErrors.institution = "School/Institution name is required.";
    if (!entry.qualification.trim()) entryErrors.qualification = "Degree/Qualification is required.";
    if (!entry.date) entryErrors.date = "Graduation/Completion date is required.";
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    educationEntries.forEach((exp, idx) => {
      const entryErrors = validateEntry(exp);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[exp.id] = entryErrors;
        if (idx === currentEntryIndex) formIsValid = false; 
      }
    });
    setErrors(newErrors);
    const allEntriesValid = educationEntries.every(exp => Object.keys(validateEntry(exp)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };

  const handleInputChange = (field: keyof EducationEntry, value: any) => {
    setEducationEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  const addEducationEntry = () => {
    const newId = `edu-${Date.now()}`;
    const newEntry: EducationEntry = {
      id: newId,
      institution: "", qualification: "", date: null, dateFormat: "MMMM YYYY", isGraduate: true,
    };
    setEducationEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(educationEntries.length); 
  };

  const removeCurrentEducationEntry = () => {
    if (educationEntries.length <= 1) {
        setEducationEntries([{
            id: `edu-${Date.now()}`, institution: "", qualification: "", date: null, dateFormat: "MMMM YYYY", isGraduate: true,
        }]);
        setCurrentEntryIndex(0);
        setErrors({});
        return;
    }
    const entryIdToRemove = educationEntries[currentEntryIndex].id;
    setEducationEntries(prev => prev.filter(exp => exp.id !== entryIdToRemove));
    setCurrentEntryIndex(prev => Math.max(0, prev - 1));
    setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[entryIdToRemove];
        return newErrors;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    const { allFormsValid } = validateAllEntries();
    if (!allFormsValid) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in all education entries before saving.",
        variant: "destructive",
      });
      const firstErrorEntryIndex = educationEntries.findIndex(exp => Object.keys(validateEntry(exp)).length > 0);
      if (firstErrorEntryIndex !== -1) {
        setCurrentEntryIndex(firstErrorEntryIndex);
      }
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(educationEntries);
    setIsSaving(false);
    toast({
      title: "Education Section Saved",
      description: "Your education details have been updated.",
    });
  };
  
  const currentEntry = educationEntries[currentEntryIndex];

  if (!currentEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading education data or no entries available.
        <Button onClick={addEducationEntry} variant="outline" className="mt-4">Add First Education Entry</Button>
      </div>
    );
  }
  const entryErrors = (errors[currentEntry.id] as Record<string, string>) || {};
  const navigationHeaderTitle = `${currentEntry.qualification || "New Qualification"} at ${currentEntry.institution || "Institution"}`;

  const getFormattedDateString = (date: Date | null, dateFormat: string | undefined): string => {
    if (!date) return "Pick a date";
    switch (dateFormat) {
      case "YYYY": return format(date, "yyyy");
      case "MM/YYYY": return format(date, "MM/yyyy");
      case "MMMM YYYY":
      default:
        return format(date, "MMMM yyyy");
    }
  };

  return (
      <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
        <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
              {navigationHeaderTitle}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {educationEntries.length}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(educationEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === educationEntries.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentEducationEntry}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} id="educationForm" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`institution-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHICH <span className="font-bold">INSTITUTION</span> DID YOU ATTEND? <span className="text-red-500">*</span></Label>
                <Input 
                  id={`institution-${currentEntry.id}`} 
                  value={currentEntry.institution} 
                  onChange={(e) => handleInputChange('institution', e.target.value)} 
                  placeholder="e.g., State University" 
                  className={`bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background ${entryErrors.institution ? "border-destructive": ""}`}
                />
                {entryErrors.institution && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.institution}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`qualification-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT <span className="font-bold">DEGREE</span> DID YOU EARN? <span className="text-red-500">*</span></Label>
                <Input 
                  id={`qualification-${currentEntry.id}`} 
                  value={currentEntry.qualification} 
                  onChange={(e) => handleInputChange('qualification', e.target.value)} 
                  placeholder="e.g., B.S. in Computer Science" 
                  className={`bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background ${entryErrors.qualification ? "border-destructive": ""}`}
                />
                {entryErrors.qualification && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.qualification}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`date-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHEN DID YOU <span className="font-bold">GRADUATE</span>? <span className="text-red-500">*</span></Label>
                <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start font-normal bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background ${!currentEntry.date && "text-muted-foreground"} ${entryErrors.date ? "border-destructive": ""}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getFormattedDateString(currentEntry.date, currentEntry.dateFormat)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={currentEntry.date} onSelect={(dateVal) => handleInputChange('date', dateVal)} captionLayout="dropdown-buttons" fromYear={1980} toYear={new Date().getFullYear()}/>
                </PopoverContent>
              </Popover>
              {entryErrors.date && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`dateFormat-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">HOW SHOULD THE <span className="font-bold">DATE</span> BE DISPLAYED?</Label>
                <Select value={currentEntry.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                  <SelectTrigger 
                    id={`dateFormat-${currentEntry.id}`}
                    className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background"
                  >
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMAT_OPTIONS.map(format => (
                      <SelectItem key={format} value={format}>{format}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`location-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHERE IS THE <span className="font-bold">INSTITUTION</span> LOCATED?</Label>
                <Input 
                  id={`location-${currentEntry.id}`} 
                  value={currentEntry.location || ""} 
                  onChange={(e) => handleInputChange('location', e.target.value)} 
                  placeholder="e.g., City, State" 
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`minor-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT WAS YOUR <span className="font-bold">MINOR</span>?</Label>
                <Input 
                  id={`minor-${currentEntry.id}`} 
                  value={currentEntry.minor || ""} 
                  onChange={(e) => handleInputChange('minor', e.target.value)} 
                  placeholder="e.g., Mathematics" 
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`score-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT <span className="font-bold">SCORE</span> DID YOU ACHIEVE?</Label>
                <Input 
                  id={`score-${currentEntry.id}`} 
                  value={currentEntry.score || ""} 
                  onChange={(e) => handleInputChange('score', e.target.value)} 
                  placeholder="e.g., 3.8" 
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`scoreType-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT <span className="font-bold">TYPE</span> OF SCORE IS IT?</Label>
                <Input 
                  id={`scoreType-${currentEntry.id}`} 
                  value={currentEntry.scoreType || ""} 
                  onChange={(e) => handleInputChange('scoreType', e.target.value)} 
                  placeholder="e.g., GPA, Percentage" 
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
                />
              </div>
            </div>


            <div className="space-y-1.5">
              <Label htmlFor={`details-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">ADDITIONAL <span className="font-bold">DETAILS</span></Label>
              <Textarea 
                id={`details-${currentEntry.id}`} 
                value={currentEntry.details || ""} 
                onChange={(e) => handleInputChange('details', e.target.value)} 
                placeholder="e.g., Thesis title, Relevant Coursework, Honors..." 
                rows={3}
                className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
              />
            </div>
          </form>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
          <Button type="button" variant="ghost" onClick={addEducationEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Education Entry
          </Button>
          <Button type="submit" form="educationForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Education Section
          </Button>
        </div>
      </div>
  );
}