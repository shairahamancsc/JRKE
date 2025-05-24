
"use client";

import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Loader2, Share2, Briefcase, IndianRupee, Landmark, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { BulkDailyLogEntriesFormData } from '@/components/daily-entry/daily-entry-form';
import type { DailyLogEntry, Labour, PaymentMethod, AdvancePayment } from '@/lib/types';
import { initialDailyLogEntries /*, initialLabours */, initialAdvancePayments } from '@/lib/data'; // Removed initialLabours
import { format, parseISO, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DAILY_ENTRIES_STORAGE_KEY, LABOURS_STORAGE_KEY, ADVANCES_STORAGE_KEY } from '@/lib/storageKeys';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';
import { ScrollArea } from '@/components/ui/scroll-area';

const DailyEntryForm = lazy(() => import('@/components/daily-entry/daily-entry-form').then(module => ({ default: module.DailyEntryForm })));

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  phonepe: 'PhonePe',
  account: 'Account Pay',
};

interface GroupedEntries {
  [date: string]: {
    entries: DailyLogEntry[];
    workLocations: Set<string>;
  };
}

export default function DailyEntryPage() {
  const [dailyEntries, setDailyEntries] = useDebouncedLocalStorage<DailyLogEntry[]>(
    DAILY_ENTRIES_STORAGE_KEY,
    initialDailyLogEntries
  );
  const [labours, setLabours] = useState<Labour[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [lastSubmissionDetails, setLastSubmissionDetails] = useState<{
    date: Date;
    workLocation?: string;
    entries: DailyLogEntry[];
  } | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        setLabours([]);
        console.warn(`${LABOURS_STORAGE_KEY} not found in localStorage for daily entry page. Labours list will be empty.`);
      }
    } catch (error) {
      console.error("Error loading labours from localStorage for daily entry page:", error);
      setLabours([]); 
      toast({
        variant: "destructive",
        title: "Error Loading Labour Data",
        description: "Could not load labour information for daily entries. Please ensure Labours page has data."
      });
    }

    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = "";
    }
  }, [toast]);

  const getLabourInfo = useCallback((labourId: string) => {
    const labour = labours.find(l => l.id === labourId);
    return {
      name: labour?.name || 'Unknown Labour',
      photoPreview: labour?.photoPreview
    };
  }, [labours]);

  const handleAddEntry = useCallback(() => {
    if (labours.length === 0) {
      toast({
        title: "No Labours Found",
        description: "Please add labours first before making daily entries.",
        variant: "destructive",
      });
      return;
    }
    setIsFormOpen(true);
    setLastSubmissionDetails(null);
  }, [labours, toast]);

  const handleFormSubmit = useCallback((formData: BulkDailyLogEntriesFormData) => {
    const newDailyEntriesList: DailyLogEntry[] = [];
    const newAdvancePaymentsList: AdvancePayment[] = [];

    formData.entries.forEach(entryData => {
      const labourInfo = getLabourInfo(entryData.labourId);
      const advanceAmount = entryData.advanceAmount ? Number(entryData.advanceAmount) : undefined;
      
      const dailyEntry: DailyLogEntry = {
        id: crypto.randomUUID(),
        labourId: entryData.labourId,
        date: formData.date.toISOString(),
        attendanceStatus: entryData.attendanceStatus,
        advanceAmount: advanceAmount,
        advancePaymentMethod: advanceAmount && advanceAmount > 0 ? entryData.advancePaymentMethod : undefined,
        advanceRemarks: advanceAmount && advanceAmount > 0 ? entryData.advanceRemarks : undefined,
        workLocation: entryData.attendanceStatus === 'present' ? formData.workLocation : undefined,
        labourName: labourInfo.name,
        labourPhotoPreview: labourInfo.photoPreview,
      };
      newDailyEntriesList.push(dailyEntry);

      if (advanceAmount && advanceAmount > 0) {
        const advancePayment: AdvancePayment = {
          id: crypto.randomUUID(),
          labourId: entryData.labourId,
          date: formData.date.toISOString(),
          amount: advanceAmount,
          paymentMethod: entryData.advancePaymentMethod,
          remarks: entryData.advanceRemarks || `Advance from daily entry on ${format(formData.date, 'PPP')}`,
        };
        newAdvancePaymentsList.push(advancePayment);
      }
    });

    setDailyEntries(currentEntries => [...newDailyEntriesList, ...currentEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime() || (a.labourName || "").localeCompare(b.labourName || "")));

    if (newAdvancePaymentsList.length > 0) {
      try {
        const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
        const currentAdvances: AdvancePayment[] = storedAdvances ? JSON.parse(storedAdvances) : initialAdvancePayments;
        const updatedAdvances = [...newAdvancePaymentsList, ...currentAdvances].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        localStorage.setItem(ADVANCES_STORAGE_KEY, JSON.stringify(updatedAdvances));
      } catch (error) {
        console.error("Error updating advances in localStorage from daily entry:", error);
        toast({
          title: "Advance Saving Error",
          description: "Could not save new advances to the main list. They are recorded with the daily log.",
          variant: "destructive"
        });
      }
    }

    toast({
      title: "Daily Logs Added",
      description: `${newDailyEntriesList.length} log(s) for ${format(formData.date, 'PPP')} have been recorded. ${newAdvancePaymentsList.length > 0 ? `${newAdvancePaymentsList.length} advance(s) also recorded.` : ''}`
    });
    setLastSubmissionDetails({
      date: formData.date,
      workLocation: formData.workLocation,
      entries: newDailyEntriesList,
    });
    setIsFormOpen(false);
  }, [getLabourInfo, setDailyEntries, toast, setLastSubmissionDetails, setIsFormOpen]);


  const handleShareToWhatsApp = useCallback(() => {
    if (!lastSubmissionDetails) return;

    const { date, workLocation, entries } = lastSubmissionDetails;
    const formattedDate = format(date, 'dd/MM/yyyy');
    const presentLaboursList = entries
      .filter(e => e.attendanceStatus === 'present')
      .map(e => e.labourName || 'Unknown Labour');
    const presentLaboursText = presentLaboursList.length > 0 ? presentLaboursList.join('\n- ') : 'No one present';
    const advancesTakenList = entries
      .filter(e => e.advanceAmount && e.advanceAmount > 0)
      .map(e => `${e.labourName || 'Unknown Labour'}: ₹${e.advanceAmount?.toFixed(2)}`);
    const advancesTakenText = advancesTakenList.length > 0 ? advancesTakenList.join('\n- ') : 'No advances taken';

    let message = `${formattedDate}\n\n`;
    message += `Present:\n- ${presentLaboursText}\n\n`;
    if (workLocation && presentLaboursList.length > 0) {
      message += `Work Info:\n${workLocation}\n\n`;
    } else if (presentLaboursList.length > 0) {
      message += `Work Info:\nNot Specified\n\n`;
    }
    message += `Advances:\n- ${advancesTakenText}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message.trim())}`;
    window.open(whatsappUrl, '_blank');
  }, [lastSubmissionDetails]);

  const groupedEntries = useMemo(() => {
    return dailyEntries.reduce((acc: GroupedEntries, entry) => {
      const dateStr = format(startOfDay(parseISO(entry.date)), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = { entries: [], workLocations: new Set() };
      }
      acc[dateStr].entries.push(entry);
      if (entry.workLocation) {
        acc[dateStr].workLocations.add(entry.workLocation);
      }
      return acc;
    }, {});
  }, [dailyEntries]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedEntries).sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());
  }, [groupedEntries]);

  const toggleDateExpansion = useCallback((dateStr: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Labour Entries</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleAddEntry}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={labours.length === 0}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Daily Logs
          </Button>
          {lastSubmissionDetails && (
            <Button
              onClick={handleShareToWhatsApp}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:text-white"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share via WhatsApp
            </Button>
          )}
        </div>
      </div>
      {labours.length === 0 && !isFormOpen && (
        <p className="text-muted-foreground mb-4">Please add labours in the 'Labours' section to make daily entries.</p>
      )}

      <div className="space-y-6">
        {sortedDates.length === 0 && !isFormOpen && (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center text-muted-foreground">
              No daily log entries found. Click 'Add Daily Logs' to get started.
            </CardContent>
          </Card>
        )}
        {sortedDates.map(dateStr => {
          const { entries, workLocations } = groupedEntries[dateStr];
          const presentEntries = entries.filter(e => e.attendanceStatus === 'present');
          const absentEntries = entries.filter(e => e.attendanceStatus === 'absent');
          const advanceEntries = entries.filter(e => e.advanceAmount && e.advanceAmount > 0);
          const isExpanded = expandedDates.has(dateStr);

          return (
            <Card key={dateStr} className="shadow-md overflow-hidden">
              <CardHeader
                className="flex flex-row items-center justify-between space-y-0 p-4 bg-card hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleDateExpansion(dateStr)}
              >
                <CardTitle className="text-lg font-semibold">
                  {format(parseISO(dateStr), 'PPP')}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{presentEntries.length} Present</span>
                  <span>{absentEntries.length} Absent</span>
                  <span>{advanceEntries.length} Advances</span>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-4 pt-0 border-t">
                  <ScrollArea className="max-h-[60vh]">
                     <div className="space-y-4 pt-4 pr-3">
                        {workLocations.size > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Work Location(s)</h4>
                            <ul className="list-disc list-inside pl-2 text-muted-foreground space-y-1">
                              {Array.from(workLocations).map((loc, i) => <li key={i}>{loc || 'Not specified'}</li>)}
                            </ul>
                          </div>
                        )}
                        <Accordion type="multiple" defaultValue={['present', 'absent', 'advances']}>
                          {presentEntries.length > 0 && (
                             <AccordionItem value="present">
                                <AccordionTrigger className="text-md font-medium text-green-700 dark:text-green-400 hover:no-underline">
                                  Present ({presentEntries.length})
                                </AccordionTrigger>
                                <AccordionContent className="pl-2">
                                   <div className="space-y-3 mt-2">
                                      {presentEntries.map(entry => (
                                         <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md bg-background/50 border">
                                            <Avatar className="h-9 w-9">
                                              <AvatarImage src={entry.labourPhotoPreview} alt={entry.labourName || "Labour"} data-ai-hint="person face"/>
                                              <AvatarFallback><UserCircle2 className="h-5 w-5"/></AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{entry.labourName || 'Unknown Labour'}</span>
                                         </div>
                                      ))}
                                   </div>
                                </AccordionContent>
                             </AccordionItem>
                          )}
                           {absentEntries.length > 0 && (
                             <AccordionItem value="absent">
                                <AccordionTrigger className="text-md font-medium text-red-700 dark:text-red-400 hover:no-underline">
                                  Absent ({absentEntries.length})
                                </AccordionTrigger>
                                <AccordionContent className="pl-2">
                                   <div className="space-y-3 mt-2">
                                      {absentEntries.map(entry => (
                                         <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md bg-background/50 border">
                                            <Avatar className="h-9 w-9">
                                              <AvatarImage src={entry.labourPhotoPreview} alt={entry.labourName || "Labour"} data-ai-hint="person face"/>
                                              <AvatarFallback><UserCircle2 className="h-5 w-5"/></AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{entry.labourName || 'Unknown Labour'}</span>
                                         </div>
                                      ))}
                                   </div>
                                </AccordionContent>
                             </AccordionItem>
                          )}
                           {advanceEntries.length > 0 && (
                             <AccordionItem value="advances">
                                <AccordionTrigger className="text-md font-medium text-blue-700 dark:text-blue-400 hover:no-underline">
                                  Advances ({advanceEntries.length})
                                </AccordionTrigger>
                                <AccordionContent className="pl-2">
                                  <div className="space-y-3 mt-2">
                                    {advanceEntries.map(entry => (
                                      <Card key={`${entry.id}-advance`} className="p-3 bg-background/50 border">
                                         <div className="flex items-center gap-3 mb-2">
                                            <Avatar className="h-9 w-9">
                                              <AvatarImage src={entry.labourPhotoPreview} alt={entry.labourName || "Labour"} data-ai-hint="person face"/>
                                              <AvatarFallback><UserCircle2 className="h-5 w-5"/></AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{entry.labourName || 'Unknown Labour'}</span>
                                         </div>
                                        <div className="text-sm space-y-1 pl-12">
                                          <div className="flex items-center gap-1.5">
                                            <IndianRupee className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="font-semibold">₹{entry.advanceAmount?.toFixed(2)}</span>
                                            {entry.advancePaymentMethod && (
                                                <Badge variant="secondary" className="ml-2 whitespace-nowrap text-xs">
                                                   <Landmark className="inline h-3 w-3 mr-1 text-muted-foreground" />
                                                   {paymentMethodLabels[entry.advancePaymentMethod] || entry.advancePaymentMethod}
                                                </Badge>
                                             )}
                                          </div>
                                          {entry.advanceRemarks && (
                                            <div className="flex items-start gap-1.5">
                                              <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                              <p className="text-muted-foreground">{entry.advanceRemarks}</p>
                                            </div>
                                          )}
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                </AccordionContent>
                             </AccordionItem>
                           )}
                        </Accordion>
                      </div>
                   </ScrollArea>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {isFormOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-card p-6 rounded-lg shadow-xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading Form...</span>
            </div>
          </div>
        }>
          <DailyEntryForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            labours={labours}
          />
        </Suspense>
      )}
    </div>
  );
}
