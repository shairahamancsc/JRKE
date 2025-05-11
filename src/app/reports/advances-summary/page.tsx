
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { summarizeAdvancePaymentsAction } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import type { Labour, AdvancePayment } from '@/lib/types';
import { initialLabours, initialAdvancePayments } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { LABOURS_STORAGE_KEY, ADVANCES_STORAGE_KEY } from '@/lib/storageKeys';

const MarkdownDisplay = lazy(() => import('@/components/reports/markdown-display').then(module => ({ default: module.MarkdownDisplay })));

const advanceSummarySchema = z.object({
  selectedLabourId: z.string().optional(), 
  labourDetails: z.string().min(10, "Labour details are required."),
  advancePayments: z.string().min(10, "Advance payment records are required."),
  query: z.string().min(5, "Query is too short."),
});

type AdvanceSummaryFormData = z.infer<typeof advanceSummarySchema>;

export default function AdvanceSummaryPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labours, setLabours] = useState<Labour[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<AdvanceSummaryFormData>({
    resolver: zodResolver(advanceSummarySchema),
    defaultValues: {
      labourDetails: '',
      advancePayments: '',
      query: '',
    }
  });

  const selectedLabourId = watch('selectedLabourId');

  useEffect(() => {
    // Load labours from LocalStorage
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        setLabours(initialLabours);
      }
    } catch (e) {
      console.error("Error loading labours from localStorage for advances summary:", e);
      setLabours(initialLabours);
    }

    // Load advances from LocalStorage
    try {
      const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
      if (storedAdvances) {
        setAdvances(JSON.parse(storedAdvances));
      } else {
        setAdvances(initialAdvancePayments);
      }
    } catch (e) {
      console.error("Error loading advances from localStorage for advances summary:", e);
      setAdvances(initialAdvancePayments);
    }
  }, []);

  useEffect(() => {
    if (selectedLabourId && labours.length > 0 && advances.length >= 0) { // Ensure data is loaded
      const selectedLabour = labours.find(l => l.id === selectedLabourId);
      if (selectedLabour) {
        setValue('labourDetails', `Labour Name: ${selectedLabour.name}\nDetails: ${selectedLabour.details}\nPhone: ${selectedLabour.phoneNo || 'N/A'}`);
        
        const labourAdvances = advances
          .filter(a => a.labourId === selectedLabourId)
          .map(a => `Date: ${format(parseISO(a.date), 'PPP')}, Amount: ₹${a.amount.toFixed(2)}`)
          .join('\n');
        
        setValue('advancePayments', labourAdvances || 'No advance payments found for this labour.');
        setValue('query', `Summarize advances for ${selectedLabour.name}.`);
      }
    } else if (!selectedLabourId) {
      // Pre-fill with all data if no specific labour is selected
      const allLabourDetails = labours.map(l => `Name: ${l.name}, Details: ${l.details}, Phone: ${l.phoneNo || 'N/A'}`).join('\n\n');
      setValue('labourDetails', allLabourDetails || 'No labour details available.');

      const allAdvanceDetails = advances.map(a => {
        const labourName = labours.find(l => l.id === a.labourId)?.name || 'Unknown';
        return `Labour: ${labourName}, Date: ${format(parseISO(a.date), 'PPP')}, Amount: ₹${a.amount.toFixed(2)}`;
      }).join('\n');
      setValue('advancePayments', allAdvanceDetails || 'No advance payments recorded.');
      setValue('query', 'Summarize all advance payments.');
    }
  }, [selectedLabourId, labours, advances, setValue]);

  const handleFormSubmit: SubmitHandler<AdvanceSummaryFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const { selectedLabourId: sId, ...actionData } = data; // Renamed to avoid conflict
      const result = await summarizeAdvancePaymentsAction(actionData);
      if (result.success && result.summary) {
        setSummary(result.summary);
        toast({ title: "Summary Generated", description: "Advance payments summary successfully generated." });
      } else {
        setError(result.error || "Failed to generate summary.");
        toast({ title: "Error", description: result.error || "Failed to generate summary.", variant: "destructive" });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Summarize Advance Payments</CardTitle>
          <CardDescription>
            Optionally select a labour to pre-fill details, or manually enter information. Then, provide a specific query to get an AI-generated summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="selectedLabourId">Select Labour (Optional)</Label>
              <Controller
                name="selectedLabourId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <SelectTrigger id="selectedLabourId">
                      <SelectValue placeholder="Select a labour to pre-fill details" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- All Labours / Manual Input --</SelectItem>
                      {labours.map(labour => (
                        <SelectItem key={labour.id} value={labour.id}>
                          {labour.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="labourDetails" className="font-semibold">Labour Details</Label>
              <Textarea
                id="labourDetails"
                {...register('labourDetails')}
                rows={5}
                placeholder="Enter details of labours, including names, roles, etc. This will be pre-filled if a labour is selected or based on all labours if none is selected."
                className={`mt-1 ${errors.labourDetails ? 'border-destructive' : ''}`}
              />
              {errors.labourDetails && <p className="text-xs text-destructive mt-1">{errors.labourDetails.message}</p>}
            </div>

            <div>
              <Label htmlFor="advancePayments" className="font-semibold">Advance Payment Records</Label>
              <Textarea
                id="advancePayments"
                {...register('advancePayments')}
                rows={8}
                placeholder="Enter a list of advance payments, including labour name, date, and amount for each. This will be pre-filled."
                className={`mt-1 ${errors.advancePayments ? 'border-destructive' : ''}`}
              />
              {errors.advancePayments && <p className="text-xs text-destructive mt-1">{errors.advancePayments.message}</p>}
            </div>

            <div>
              <Label htmlFor="query" className="font-semibold">Your Query</Label>
              <Input
                id="query"
                {...register('query')}
                placeholder="e.g., What is the total advance paid to John Doe in January?"
                className={`mt-1 ${errors.query ? 'border-destructive' : ''}`}
              />
              {errors.query && <p className="text-xs text-destructive mt-1">{errors.query.message}</p>}
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Summary...
                </>
              ) : (
                'Generate Summary'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
         <Card className="mt-6 max-w-2xl mx-auto bg-destructive/10 border-destructive shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error Generating Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Suspense fallback={
          <div className="mt-6 max-w-2xl mx-auto p-6 flex items-center justify-center bg-card rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span>Loading Report...</span>
          </div>
        }>
          <MarkdownDisplay markdownContent={summary} />
        </Suspense>
      )}
    </div>
  );
}
