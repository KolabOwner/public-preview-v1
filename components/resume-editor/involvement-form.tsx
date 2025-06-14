'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Save, Loader2, Info, PlusCircle, Trash2, ChevronLeft, ChevronRight, AlertCircle, MapPin, Building2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface InvolvementEntry {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface InvolvementFormProps {
  initialData: InvolvementEntry[];
  onSave: (data: InvolvementEntry[]) => void;
}

export default function InvolvementForm({ initialData, onSave }: InvolvementFormProps) {
  const [involvementEntries, setInvolvementEntries] = useState<InvolvementEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const processedData = initialData.map(inv => {
      // Handle different data structures (from Firestore vs form)
      return {
        id: inv.id || `inv-${Date.now()}`,
        // Map fields, with fallbacks for different field names
        organization: inv.organization || "",
        role: inv.role || inv.position || "",
        location: inv.location || "",
        startDate: inv.startDate || "",
        endDate: inv.endDate || "",
        current: inv.current || false,
        description: inv.description || inv.activities || ""
      };
    });

    setInvolvementEntries(processedData.length > 0 ? processedData : [{
      id: `inv-${Date.now()}`,
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const validateEntry = (entry: InvolvementEntry): Record<string, string> => {
    const entryErrors: Record<string, string> = {};
    if (!entry.organization.trim()) entryErrors.organization = "Organization name is required.";
    if (!entry.role.trim()) entryErrors.role = "Role/position is required.";
    if (!entry.startDate.trim()) entryErrors.startDate = "Start date is required.";
    if (!entry.current && !entry.endDate.trim()) entryErrors.endDate = "End date is required when not current.";
    return entryErrors;
  };

  const validateAllEntries = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let formIsValid = true;
    
    // Filter out entries that are completely empty before validation
    const filledEntries = involvementEntries.filter(entry => 
      entry.organization.trim() || entry.role.trim() || entry.location.trim() || 
      entry.startDate.trim() || entry.endDate.trim() || entry.description.trim()
    );

    filledEntries.forEach((entry) => {
      const entryErrors = validateEntry(entry);
      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
        // Find original index to correctly highlight error if current view matches
        const originalIndex = involvementEntries.findIndex(inv => inv.id === entry.id);
        if (originalIndex === currentEntryIndex) formIsValid = false;
      }
    });
    
    setErrors(newErrors);
    const allEntriesValid = filledEntries.every(entry => Object.keys(validateEntry(entry)).length === 0);
    return { currentFormValid: formIsValid, allFormsValid: allEntriesValid };
  };

  const handleInputChange = (field: keyof InvolvementEntry, value: any) => {
    setInvolvementEntries(prev => prev.map((entry, idx) => {
      if (idx === currentEntryIndex) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));

    // Clear error when field is corrected
    if (errors[involvementEntries[currentEntryIndex]?.id]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[involvementEntries[currentEntryIndex].id][field];
      if (Object.keys(updatedErrors[involvementEntries[currentEntryIndex].id]).length === 0) {
        delete updatedErrors[involvementEntries[currentEntryIndex].id];
      }
      setErrors(updatedErrors);
    }
  };

  const addInvolvementEntry = () => {
    const newId = `inv-${Date.now()}`;
    const newEntry: InvolvementEntry = {
      id: newId,
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setInvolvementEntries(prev => [...prev, newEntry]);
    setCurrentEntryIndex(involvementEntries.length);
  };

  const removeCurrentInvolvementEntry = () => {
    if (involvementEntries.length <= 1) {
      setInvolvementEntries([{
        id: `inv-${Date.now()}`,
        organization: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]);
      setCurrentEntryIndex(0);
      setErrors({});
      return;
    }
    
    const entryIdToRemove = involvementEntries[currentEntryIndex].id;
    setInvolvementEntries(prev => prev.filter(inv => inv.id !== entryIdToRemove));
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
      const firstErrorEntryIndex = involvementEntries.findIndex(entry => {
        // Skip completely empty entries
        if (!entry.organization.trim() && !entry.role.trim() && !entry.location.trim() &&
          !entry.startDate.trim() && !entry.endDate.trim() && !entry.description.trim()) {
          return false;
        }
        return Object.keys(validateEntry(entry)).length > 0;
      });
      
      if (firstErrorEntryIndex !== -1) {
        setCurrentEntryIndex(firstErrorEntryIndex);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the involvement entries.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const validEntries = involvementEntries.filter(entry => 
      entry.organization.trim() && entry.role.trim()
    );
    onSave(validEntries);
    setIsSaving(false);
    toast({
      title: "Involvement Section Saved",
      description: "Your activities and involvement information has been updated.",
    });
  };

  const currentEntry = involvementEntries[currentEntryIndex];

  if (!currentEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading involvement data or no entries available.
        <Button onClick={addInvolvementEntry} variant="outline" className="mt-4">Add First Involvement</Button>
      </div>
    );
  }
  
  const entryErrors = errors[currentEntry.id] || {};
  const navigationHeaderTitle = currentEntry.role 
    ? `${currentEntry.role} at ${currentEntry.organization}` 
    : currentEntry.organization || "New Involvement";

  return (
    <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <Users className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-base font-semibold truncate" title={navigationHeaderTitle}>
            {navigationHeaderTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground mr-1">{currentEntryIndex + 1} of {involvementEntries.length}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))} disabled={currentEntryIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentEntryIndex(Math.min(involvementEntries.length - 1, currentEntryIndex + 1))} disabled={currentEntryIndex === involvementEntries.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={removeCurrentInvolvementEntry}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} id="involvementForm" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`organization-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">ORGANIZATION <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id={`organization-${currentEntry.id}`}
                  value={currentEntry.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="e.g., Student Government Association"
                  className={cn(
                    "bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background pl-9",
                    entryErrors.organization ? "border-destructive" : ""
                  )}
                />
              </div>
              {entryErrors.organization && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.organization}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`role-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">ROLE / POSITION <span className="text-red-500">*</span></Label>
              <Input
                id={`role-${currentEntry.id}`}
                value={currentEntry.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., Treasurer, Volunteer, Team Captain"
                className={cn("bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background", entryErrors.role ? "border-destructive" : "")}
              />
              {entryErrors.role && <p className="text-xs text-destructive flex items-center"><AlertCircle size={14} className="mr-1"/>{entryErrors.role}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`location-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">LOCATION</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id={`location-${currentEntry.id}`}
                  value={currentEntry.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Boston, MA"
                  className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`startDate-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">START DATE <span className="text-red-500">*</span></Label>
                <Input
                  id={`startDate-${currentEntry.id}`}
                  value={currentEntry.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="e.g., Sept 2022"
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
                  placeholder={currentEntry.current ? "Present" : "e.g., May 2023"}
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
          
          <div className="space-y-1.5">
            <Label htmlFor={`description-${currentEntry.id}`} className="text-xs uppercase tracking-wider font-semibold">DESCRIPTION OF ACTIVITIES</Label>
            <Textarea
              id={`description-${currentEntry.id}`}
              value={currentEntry.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your responsibilities, achievements, and impact..."
              rows={5}
              className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background"
            />
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info size={14} className="mr-1.5 shrink-0"/>
              Use bullet points (• or -) to highlight specific achievements or responsibilities.
            </p>
          </div>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
        <Button type="button" variant="ghost" onClick={addInvolvementEntry} className="w-full sm:w-auto hover:bg-background/50 dark:hover:bg-background/20">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Involvement
        </Button>
        <Button type="submit" form="involvementForm" disabled={isSaving} size="lg" className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Involvement Section
        </Button>
      </div>
    </div>
  );
}