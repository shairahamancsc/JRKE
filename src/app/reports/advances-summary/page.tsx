
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
import type { Laborer, AdvancePayment } from '@/lib/types';
import { initialLaborers, initialAdvancePayments } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { LABORERS_STORAGE_KEY, ADVANCES_STORAGE_KEY } from '@/lib/storageKeys';

const MarkdownDisplay = lazy(() => import('@/components/reports/markdown-display').then(module => ({ default: module.MarkdownDisplay })));

const advanceSummarySchema = z.object({
  selectedLaborerId: z.string().optional(), 
  laborDetails: z.string().min(10, "Laborer details are required."),
  advancePayments: z.string().min(10, "Advance payment records are required."),
  query: z.string().min(5, "Query is too short."),
});

type AdvanceSummaryFormData = z.infer<typeof advanceSummarySchema>;

export default function AdvanceSummaryPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<AdvanceSummaryFormData>({
    resolver: zodResolver(advanceSummarySchema),
    defaultValues: {
      laborDetails: '',
      advancePayments: '',
      query: '',
    }
  });

  const selectedLaborerId = watch('selectedLaborerId');

  useEffect(() => {
    // Load laborers from LocalStorage
    try {
      const storedLaborers = localStorage.getItem(LABORERS_STORAGE_KEY);
      if (storedLaborers) {
        setLaborers(JSON.parse(storedLaborers));
      } else {
        setLaborers(initialLaborers);
      }
    } catch (e) {
      console.error("Error loading laborers from localStorage for advances summary:", e);
      setLaborers(initialLaborers);
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
    if (selectedLaborerId && laborers.length > 0 && advances.length >= 0) { // Ensure data is loaded
      const selectedLaborer = laborers.find(l => l.id === selectedLaborerId);
      if (selectedLaborer) {
        setValue('laborDetails', `Laborer Name: ${selectedLaborer.name}\nDetails: ${selectedLaborer.details}\nPhone: ${selectedLaborer.phoneNo || 'N/A'}`);
        
        const laborerAdvances = advances
          .filter(a => a.laborerId === selectedLaborerId)
          .map(a => `Date: ${format(parseISO(a.date), 'PPP')}, Amount: ₹${a.amount.toFixed(2)}`)
          .join('\n');
        
        setValue('advancePayments', laborerAdvances || 'No advance payments found for this laborer.');
        setValue('query', `Summarize advances for ${selectedLaborer.name}.`);
      }
    } else if (!selectedLaborerId) {
      // Pre-fill with all data if no specific laborer is selected
      const allLaborerDetails = laborers.map(l => `Name: ${l.name}, Details: ${l.details}, Phone: ${l.phoneNo || 'N/A'}`).join('\n\n');
      setValue('laborDetails', allLaborerDetails || 'No laborer details available.');

      const allAdvanceDetails = advances.map(a => {
        const laborerName = laborers.find(l => l.id === a.laborerId)?.name || 'Unknown';
        return `Laborer: ${laborerName}, Date: ${format(parseISO(a.date), 'PPP')}, Amount: ₹${a.amount.toFixed(2)}`;
      }).join('\n');
      setValue('advancePayments', allAdvanceDetails || 'No advance payments recorded.');
      setValue('query', 'Summarize all advance payments.');
    }
  }, [selectedLaborerId, laborers, advances, setValue]);

  const handleFormSubmit: SubmitHandler<AdvanceSummaryFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const { selectedLaborerId: sId, ...actionData } = data; // Renamed to avoid conflict
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
            Optionally select a laborer to pre-fill details, or manually enter information. Then, provide a specific query to get an AI-generated summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="selectedLaborerId">Select Laborer (Optional)</Label>
              <Controller
                name="selectedLaborerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <SelectTrigger id="selectedLaborerId">
                      <SelectValue placeholder="Select a laborer to pre-fill details" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- All Laborers / Manual Input --</SelectItem>
                      {laborers.map(laborer => (
                        <SelectItem key={laborer.id} value={laborer.id}>
                          {laborer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="laborDetails" className="font-semibold">Laborer Details</Label>
              <Textarea
                id="laborDetails"
                {...register('laborDetails')}
                rows={5}
                placeholder="Enter details of laborers, including names, roles, etc. This will be pre-filled if a laborer is selected or based on all laborers if none is selected."
                className={`mt-1 ${errors.laborDetails ? 'border-destructive' : ''}`}
              />
              {errors.laborDetails && <p className="text-xs text-destructive mt-1">{errors.laborDetails.message}</p>}
            </div>

            <div>
              <Label htmlFor="advancePayments" className="font-semibold">Advance Payment Records</Label>
              <Textarea
                id="advancePayments"
                {...register('advancePayments')}
                rows={8}
                placeholder="Enter a list of advance payments, including laborer name, date, and amount for each. This will be pre-filled."
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
