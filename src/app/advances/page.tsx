
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
// import { AdvanceForm } from '@/components/advances/advance-form'; // Lazy loaded
import { DataTable } from '@/components/common/data-table';
import type { AdvancePayment, Laborer } from '@/lib/types';
import { initialAdvancePayments, initialLaborers } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ADVANCES_STORAGE_KEY, LABORERS_STORAGE_KEY } from '@/lib/storageKeys';

const AdvanceForm = lazy(() => import('@/components/advances/advance-form').then(module => ({ default: module.AdvanceForm })));

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load advances from LocalStorage
    try {
      const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
      if (storedAdvances) {
        setAdvances(JSON.parse(storedAdvances));
      } else {
        setAdvances(initialAdvancePayments);
      }
    } catch (error) {
      console.error("Error loading advances from localStorage:", error);
      setAdvances(initialAdvancePayments);
    }

    // Load laborers from LocalStorage (read-only for this page)
    try {
      const storedLaborers = localStorage.getItem(LABORERS_STORAGE_KEY);
      if (storedLaborers) {
        setLaborers(JSON.parse(storedLaborers));
      } else {
        setLaborers(initialLaborers);
      }
    } catch (error) {
      console.error("Error loading laborers from localStorage for advances page:", error);
      setLaborers(initialLaborers);
    }

    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; // Clear hash
    }
  }, []);

  // Save advances to LocalStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(ADVANCES_STORAGE_KEY, JSON.stringify(advances));
    } catch (error) {
      console.error("Error saving advances to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save advance payment data. Your browser storage might be full or disabled.",
        variant: "destructive",
      });
    }
  }, [advances, toast]);

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
      description: `Advance of ${advanceToDelete.amount} for ${getLaborerName(advanceToDelete.laborerId)} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (advance: AdvancePayment) => {
    if (editingAdvance) {
      setAdvances(prevAdvances => prevAdvances.map(a => a.id === advance.id ? advance : a));
      toast({ title: "Advance Updated", description: `Advance for ${getLaborerName(advance.laborerId)} has been updated.` });
    } else {
      setAdvances(prevAdvances => [advance, ...prevAdvances]);
      toast({ title: "Advance Added", description: `Advance of ${advance.amount} recorded for ${getLaborerName(advance.laborerId)}.` });
    }
    setIsFormOpen(false);
    setEditingAdvance(undefined);
  };
  
  const getLaborerName = (laborerId: string) => {
    return laborers.find(l => l.id === laborerId)?.name || 'Unknown Laborer';
  };

  const columns = [
    { 
      accessorKey: (item: AdvancePayment) => getLaborerName(item.laborerId), 
      header: 'Laborer' 
    },
    { 
      accessorKey: 'date' as keyof AdvancePayment, 
      header: 'Date',
      cell: (item: AdvancePayment) => format(parseISO(item.date), 'PPP')
    },
    { 
      accessorKey: 'amount' as keyof AdvancePayment, 
      header: 'Amount',
      cell: (item: AdvancePayment) => `₹${item.amount.toFixed(2)}`
    },
  ];

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
            laborers={laborers} // Pass the loaded laborers to the form
            defaultValues={editingAdvance}
          />
        </Suspense>
      )}
    </div>
  );
}
