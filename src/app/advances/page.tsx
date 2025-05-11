
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import type { AdvancePayment, Labour, PaymentMethod } from '@/lib/types';
import { initialAdvancePayments, initialLabours } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ADVANCES_STORAGE_KEY, LABOURS_STORAGE_KEY } from '@/lib/storageKeys';
import { Badge } from '@/components/ui/badge';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';

const AdvanceForm = lazy(() => import('@/components/advances/advance-form').then(module => ({ default: module.AdvanceForm })));

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  phonepe: 'PhonePe',
  account: 'Account Pay',
};

export default function AdvancesPage() {
  const [advances, setAdvances] = useDebouncedLocalStorage<AdvancePayment[]>(
    ADVANCES_STORAGE_KEY,
    initialAdvancePayments
  );
  const [labours, setLabours] = useState<Labour[]>([]); // Labours are read, not managed by this page's debounced hook
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load labours from localStorage
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        // Initialize labours in localStorage if not present
        localStorage.setItem(LABOURS_STORAGE_KEY, JSON.stringify(initialLabours));
        setLabours(initialLabours);
      }
    } catch (error) {
      console.error("Error loading labours from localStorage for advances page:", error);
      localStorage.setItem(LABOURS_STORAGE_KEY, JSON.stringify(initialLabours));
      setLabours(initialLabours);
    }

    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);


  const handleAddAdvance = () => {
    setEditingAdvance(undefined);
    setIsFormOpen(true);
  };

  const handleEditAdvance = (advance: AdvancePayment) => {
    setEditingAdvance(advance);
    setIsFormOpen(true);
  };

  const handleDeleteAdvance = (advanceToDelete: AdvancePayment) => {
    setAdvances(prevAdvances => prevAdvances.filter(a => a.id !== advanceToDelete.id));
    toast({
      title: "Advance Deleted",
      description: `Advance of ${advanceToDelete.amount} for ${getLabourName(advanceToDelete.labourId)} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (advance: AdvancePayment) => {
    if (editingAdvance) {
      setAdvances(prevAdvances => prevAdvances.map(a => a.id === advance.id ? advance : a));
      toast({ title: "Advance Updated", description: `Advance for ${getLabourName(advance.labourId)} has been updated.` });
    } else {
      setAdvances(prevAdvances => [advance, ...prevAdvances].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      toast({ title: "Advance Added", description: `Advance of ${advance.amount} recorded for ${getLabourName(advance.labourId)}.` });
    }
    setIsFormOpen(false);
    setEditingAdvance(undefined);
  };
  
  const getLabourName = (labourId: string) => {
    return labours.find(l => l.id === labourId)?.name || 'Unknown Labour';
  };

  const columns = React.useMemo(() => [
    { 
      accessorKey: (item: AdvancePayment) => getLabourName(item.labourId), 
      header: 'Labour' 
    },
    { 
      accessorKey: 'date' as keyof AdvancePayment, 
      header: 'Date',
      cell: (item: AdvancePayment) => format(parseISO(item.date), 'PPP')
    },
    { 
      accessorKey: 'amount' as keyof AdvancePayment, 
      header: 'Amount (₹)',
      cell: (item: AdvancePayment) => `₹${item.amount.toFixed(2)}`
    },
    {
      accessorKey: 'paymentMethod' as keyof AdvancePayment,
      header: 'Payment Method',
      cell: (item: AdvancePayment) => item.paymentMethod ? (
        <Badge variant="secondary" className="whitespace-nowrap">
          {paymentMethodLabels[item.paymentMethod] || item.paymentMethod}
        </Badge>
      ) : '-'
    },
    {
      accessorKey: 'remarks' as keyof AdvancePayment,
      header: 'Remarks',
      cell: (item: AdvancePayment) => item.remarks || '-'
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [labours]); // Dependency on labours because getLabourName uses it

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Advance Payments</h1>
        <Button 
          onClick={handleAddAdvance} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Record Advance
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={advances}
        onEdit={handleEditAdvance}
        onDelete={handleDeleteAdvance}
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
          <AdvanceForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingAdvance(undefined);
            }}
            onSubmit={handleFormSubmit}
            labours={labours} 
            defaultValues={editingAdvance}
          />
        </Suspense>
      )}
    </div>
  );
}
