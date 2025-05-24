
"use client";

import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import type { WorkLog, Labour } from '@/lib/types';
import { initialWorkLogs /*, initialLabours */ } from '@/lib/data'; // Removed initialLabours to prevent overwrite
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { WORK_LOGS_STORAGE_KEY, LABOURS_STORAGE_KEY } from '@/lib/storageKeys';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';

const WorkLogForm = lazy(() => import('@/components/work-logs/work-log-form').then(module => ({ default: module.WorkLogForm })));

export default function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useDebouncedLocalStorage<WorkLog[]>(
    WORK_LOGS_STORAGE_KEY,
    initialWorkLogs
  );
  const [labours, setLabours] = useState<Labour[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        setLabours([]);
        console.warn(`${LABOURS_STORAGE_KEY} not found in localStorage for work logs page. Labours list will be empty.`);
      }
    } catch (error) {
      console.error("Error loading labours from localStorage for work logs page:", error);
      setLabours([]); 
      toast({
        variant: "destructive",
        title: "Error Loading Labour Data",
        description: "Could not load labour information for work logs. Please ensure Labours page has data."
      });
    }

    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, [toast]);


  const getLabourName = useCallback((labourId: string) => {
    return labours.find(l => l.id === labourId)?.name || 'Unknown Labour';
  }, [labours]);

  const handleAddWorkLog = useCallback(() => {
    setEditingWorkLog(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEditWorkLog = useCallback((workLog: WorkLog) => {
    setEditingWorkLog(workLog);
    setIsFormOpen(true);
  }, []);

  const handleDeleteWorkLog = useCallback((workLogToDelete: WorkLog) => {
    setWorkLogs(prevWorkLogs => prevWorkLogs.filter(wl => wl.id !== workLogToDelete.id));
    toast({
      title: "Work Log Deleted",
      description: `Work log for ${getLabourName(workLogToDelete.labourId)} on ${format(parseISO(workLogToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  }, [setWorkLogs, toast, getLabourName]);
  
  const saveWorkLog = useCallback((workLogToSave: WorkLog) => {
    const { pictureFile, ...restOfWorkLog } = workLogToSave;
    const serializableWorkLog = { ...restOfWorkLog };

    if (editingWorkLog) {
      setWorkLogs(prevWorkLogs => prevWorkLogs.map(wl => wl.id === serializableWorkLog.id ? serializableWorkLog : wl));
      toast({ title: "Work Log Updated", description: `Work log for ${getLabourName(serializableWorkLog.labourId)} has been updated.` });
    } else {
      setWorkLogs(prevWorkLogs => [serializableWorkLog, ...prevWorkLogs].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      toast({ title: "Work Log Added", description: `New work log for ${getLabourName(serializableWorkLog.labourId)} has been added.` });
    }
    setIsFormOpen(false);
    setEditingWorkLog(undefined);
  }, [editingWorkLog, getLabourName, toast, setWorkLogs, setIsFormOpen, setEditingWorkLog]);

  const handleFormSubmit = useCallback(async (workLogData: WorkLog) => { 
    let finalWorkLog = { ...workLogData }; 

    if (workLogData.pictureFile) { 
      // Preview is set by form
    } else if (editingWorkLog && !workLogData.pictureFile) {
      finalWorkLog.picturePreview = editingWorkLog.picturePreview;
    }
    saveWorkLog(finalWorkLog);
  }, [editingWorkLog, saveWorkLog]);
  
  const columns = React.useMemo(() => [
    { 
      accessorKey: (item: WorkLog) => getLabourName(item.labourId), 
      header: 'Labour' 
    },
    { 
      accessorKey: 'date' as keyof WorkLog, 
      header: 'Date',
      cell: (item: WorkLog) => format(parseISO(item.date), 'PPP')
    },
    { accessorKey: 'location' as keyof WorkLog, header: 'Location' },
    { accessorKey: 'workType' as keyof WorkLog, header: 'Work Type' },
    {
      accessorKey: 'picturePreview' as keyof WorkLog,
      header: 'Picture',
      cell: (item: WorkLog) => item.picturePreview ? (
        <Image src={item.picturePreview} alt="Work log proof" width={60} height={60} className="rounded object-cover" data-ai-hint="work site" />
      ) : (
        <span className="text-xs text-muted-foreground">No image</span>
      )
    }
  ], [getLabourName]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Work Logs</h1>
        <Button 
          onClick={handleAddWorkLog} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Work Log
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={workLogs}
        onEdit={handleEditWorkLog}
        onDelete={handleDeleteWorkLog}
      />

      {isFormOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-card p-6 rounded-lg shadow-xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading Form...</span>
            </div>
          </div>
        }>
          <WorkLogForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingWorkLog(undefined);
            }}
            onSubmit={handleFormSubmit}
            labours={labours} 
            defaultValues={editingWorkLog}
          />
        </Suspense>
      )}
    </div>
  );
}
