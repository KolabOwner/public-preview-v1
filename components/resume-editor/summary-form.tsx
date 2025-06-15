
'use client';

import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Save, Loader2, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface SummaryFormProps {
  initialData: string;
  onSave: (data: string) => void;
}

function SummaryForm({ initialData, onSave }: SummaryFormProps) {
  const [summary, setSummary] = useState<string>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSummary(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
    onSave(summary);
    setIsSaving(false);
    toast({
      title: "Summary Section Saved",
      description: "Your professional summary has been updated.",
    });
  };

  return (
      <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="space-y-1.5">
              <Textarea
                id="summary-input"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Craft a concise and impactful professional summary..."
                className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background min-h-[180px]"
                rows={6}
              />
               <p className="text-xs text-muted-foreground flex items-center pt-1">
                  <Info size={14} className="mr-1.5 shrink-0"/>
                  This is your chance to make a strong first impression. Use the AI Summary Generator tool if you need help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
              <div className="text-sm text-muted-foreground w-full sm:w-auto">
                {summary?.length > 0 && <span>{summary.length} characters</span>}
              </div>
              <Button type="submit" disabled={isSaving} size="lg" className="w-full sm:w-auto">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Summary
              </Button>
            </div>
          </form>
      </div>
  );
}

export default SummaryForm;