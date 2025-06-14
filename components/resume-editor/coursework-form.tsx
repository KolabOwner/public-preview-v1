'use client';

import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FileBadge, Building, CalendarIcon, Lightbulb, PlusCircle, Trash2, Save, Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface CourseworkEntry {
  id: string;
  name: string;
  department: string;
  date: Date | null;
  description?: string;
  skill?: string;
}

interface CourseworkFormProps {
  initialData: CourseworkEntry[];
  onSave: (data: CourseworkEntry[]) => void;
}

export function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
  const [courseworkEntries, setCourseworkEntries] = useState<CourseworkEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
     const processedData = initialData.map(cw => ({
      ...cw,
      date: cw.date ? (typeof cw.date === 'string' ? parseISO(cw.date) : cw.date) : null,
    }));
    setCourseworkEntries(processedData.length > 0 ? processedData : [{
      id: `cw-${Date.now()}`, name: "", department: "", date: null, description: "", skill: ""
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const validateEntry = (entry: CourseworkEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.name.trim()) entryErrors.name = "Course name is required.";
    if (!entry.department.trim()) entryErrors.department = "Department/Institution is required.";
    if (!entry.date) entryErrors.date = "Completion date is required.";
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    courseworkEntries.forEach((exp, idx) => {
      const entryErrors = validateEntry(exp);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[exp.id] = entryErrors;
        if (idx === currentEntryIndex) formIsValid = false; 
      }
    });
    setErrors(newErrors);
    const allEntriesValid = courseworkEntries.every(exp => Object.keys(validateEntry(exp)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };

  const handleInputChange = (field: keyof CourseworkEntry, value: any) => {
    setCourseworkEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  const addDescriptionPoint = (newPoint: string = "") => {
    setCourseworkEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        const currentDescription = entry.description ? entry.description.split('\n• ').filter(p => p.trim() !== '') : [];
        currentDescription.push(newPoint);
        const newDescription = currentDescription.length > 0 ? "• " + currentDescription.join("\n• ") : "";
        return { ...entry, description: newDescription };
      }
      return entry;
    }));
  };

  const handleDescriptionPointChange = (index: number, value: string) => {
    setCourseworkEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        let points = entry.description ? entry.description.split('\n• ').map(p => p.startsWith("• ") ? p.substring(2) : p ) : [];
        if(points.length > 0 && points[0].startsWith("• ")) points[0] = points[0].substring(2);
        else if (points.length > 0 && points[0] === "") points.shift();

        points = points.filter(p => p.trim() !== '' || p === points[index]);

        if(index < points.length) {
            points[index] = value;
        } else {
            points.push(value);
        }
        const newDescription = points.filter(p=>p.trim() !== '').length > 0 ? "• " + points.filter(p => p.trim() !== '').join("\n• ") : "";
        return { ...entry, description: newDescription };
      }
      return entry;
    }));
  };

  const removeDescriptionPoint = (index: number) => {
     setCourseworkEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        let points = entry.description ? entry.description.split('\n• ').map(p => p.startsWith("• ") ? p.substring(2) : p ) : [];
         if(points.length > 0 && points[0].startsWith("• ")) points[0] = points[0].substring(2);
         else if (points.length > 0 && points[0] === "") points.shift();

        points = points.filter(p => p.trim() !== '');
        points.splice(index, 1);
        const newDescription = points.length > 0 ? "• " + points.join("\n• ") : "";
        return { ...entry, description: newDescription };
      }
      return entry;
    }));
  };

  const addCourseworkEntry = () => {
    const newId = `cw-${Date.now()}`;
    const newEntry: CourseworkEntry = {
      id: newId, name: "", department: "", date: null, description: "", skill: ""
    };
    setCourseworkEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(courseworkEntries.length);
  };

  const removeCurrentCourseworkEntry = () => {
    if (courseworkEntries.length <= 1) {
        setCourseworkEntries([{
            id: `cw-${Date.now()}`, name: "", department: "", date: null, description: "", skill: ""
        }]);
        setCurrentEntryIndex(0);
        setErrors({});
        return;
    }
    const entryIdToRemove = courseworkEntries[currentEntryIndex].id;
    setCourseworkEntries(prev => prev.filter(exp => exp.id !== entryIdToRemove));
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
        description: "Please correct the errors in all coursework entries before saving.",
        variant: "destructive",
      });
      const firstErrorEntryIndex = courseworkEntries.findIndex(exp => Object.keys(validateEntry(exp)).length > 0);
      if (firstErrorEntryIndex !== -1) {
        setCurrentEntryIndex(firstErrorEntryIndex);
      }
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(courseworkEntries);
    setIsSaving(false);
    toast({
      title: "Coursework Saved",
      description: "Your coursework details have been updated.",
    });
  };

  const currentEntry = courseworkEntries[currentEntryIndex];

  if (!currentEntry) {
    return (
      <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
        <div className="p-4 text-center text-muted-foreground">
          Loading coursework data...
          <Button onClick={addCourseworkEntry} variant="outline" className="mt-4">Add First Course</Button>
        </div>
      </div>
    );
  }
  
  const entryErrors = (errors[currentEntry.id] as Record<string, string>) || {};
  const navigationHeaderTitle = currentEntry.name || "New Course";
  
  const descriptionPoints = currentEntry.description ? currentEntry.description.split('\n• ').map(p => p.startsWith("• ") ? p.substring(2) : p).filter(p => p.trim() !== "" || p === "") : [];
  if (descriptionPoints.length > 0 && descriptionPoints[0].startsWith("• ")) {
      descriptionPoints[0] = descriptionPoints[0].substring(2);
  } else if (descriptionPoints.length > 0 && descriptionPoints[0] === "") {
      descriptionPoints.shift();
  }

  const inputContainerClasses = "h-12 flex items-center bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 font-semibold text-base leading-6 w-full rounded border-2 px-4";

  return (
    <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <FileBadge className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
            {navigationHeaderTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {courseworkEntries.length}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(courseworkEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === courseworkEntries.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentCourseworkEntry}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} id="courseworkForm" className="space-y-4 sm:space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor={`name-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">WHAT <span className="font-bold">COURSE</span> DID YOU TAKE? <span className="text-red-500">*</span></Label>
            <div className={cn(inputContainerClasses, entryErrors.name ? "border-destructive" : "border-input")}>
              <input 
                id={`name-${currentEntry.id}`} 
                value={currentEntry.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="e.g., Data Structures and Algorithms, Machine Learning" 
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
              />
            </div>
            {entryErrors.name && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`department-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold"><span className="font-bold">DEPARTMENT</span> / INSTITUTION <span className="text-red-500">*</span></Label>
              <div className={cn(inputContainerClasses, entryErrors.department ? "border-destructive" : "border-input")}>
                <div className="flex w-full items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input 
                    id={`department-${currentEntry.id}`} 
                    value={currentEntry.department} 
                    onChange={(e) => handleInputChange('department', e.target.value)} 
                    placeholder="e.g., Computer Science, Coursera, Udemy" 
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  />
                </div>
              </div>
              {entryErrors.department && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.department}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`date-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">COMPLETION <span className="font-bold">DATE</span> <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className={cn(
                    inputContainerClasses,
                    !currentEntry.date && "text-muted-foreground",
                    entryErrors.date ? "border-destructive" : "border-input")}>
                    <div className="text-left w-full flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentEntry.date ? format(currentEntry.date, "MMMM yyyy") : "Select date"}
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={currentEntry.date} 
                    onSelect={(dateVal) => handleInputChange('date', dateVal)}
                    captionLayout="dropdown-buttons" 
                    fromYear={1980} 
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {entryErrors.date && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.date}</p>}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor={`skill-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">RELATED <span className="font-bold">SKILLS</span> (OPTIONAL)</Label>
            <div className={cn(inputContainerClasses, "border-input")}>
              <div className="flex w-full items-center">
                <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" />
                <input 
                  id={`skill-${currentEntry.id}`} 
                  value={currentEntry.skill || ""} 
                  onChange={(e) => handleInputChange('skill', e.target.value)} 
                  placeholder="e.g., Python, Data Analysis, Public Speaking" 
                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>
            
          <div className="space-y-1.5">
            <Label htmlFor="description-points" className="text-xs uppercase tracking-wider font-semibold"><span className="font-bold">DESCRIPTION</span> (OPTIONAL)</Label>
            <div className="p-2 border border-border/60 rounded-md bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus-within:bg-background/70 dark:focus-within:bg-background/30 focus-within:ring-0 focus-within:outline-none space-y-0.5">
              {descriptionPoints.length === 0 ? (
                <div className="flex items-start space-x-2 group focus-within:bg-transparent hover:bg-transparent">
                  <span className="text-primary font-semibold text-lg flex items-center justify-center mt-1 h-5 w-5 flex-shrink-0">&bull;</span>
                  <Textarea
                    value=""
                    onChange={(e) => handleDescriptionPointChange(0, e.target.value)}
                    placeholder="Describe what you learned or accomplished in this course..."
                    rows={1}
                    className="flex-grow resize-none py-1 px-0 min-h-[30px] bg-transparent !border-0 !border-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!ring-0 focus:!ring-offset-0 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none"
                  />
                </div>
              ) : (
                descriptionPoints.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-start space-x-2 group focus-within:bg-transparent hover:bg-transparent">
                    <span className="text-primary font-semibold text-lg flex items-center justify-center mt-1 h-5 w-5 flex-shrink-0">&bull;</span>
                    <Textarea
                      value={point}
                      onChange={(e) => handleDescriptionPointChange(pointIndex, e.target.value)}
                      placeholder="Describe what you learned or accomplished in this course..."
                      rows={1}
                      className="flex-grow resize-none py-1 px-0 min-h-[30px] bg-transparent !border-0 !border-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!ring-0 focus:!ring-offset-0 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none"
                    />
                    {descriptionPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDescriptionPoint(pointIndex)}
                        className="text-muted-foreground hover:text-destructive shrink-0 h-7 w-7 mt-0 opacity-50 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
            
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button type="button" variant="ghost" onClick={addCourseworkEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
              </Button>
              <Button type="button" variant="ghost" onClick={() => addDescriptionPoint('')} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Bullet
              </Button>
            </div>
            <Button type="submit" form="courseworkForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Coursework
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}