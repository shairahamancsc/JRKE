
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AdvanceForm } from '@/components/advances/advance-form';
import { DataTable } from '@/components/common/data-table';
import type { AdvancePayment, Laborer } from '@/lib/types';
import { initialAdvancePayments, initialLaborers } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setAdvances(initialAdvancePayments);
    setLaborers(initialLaborers);
     if (window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; // Clear hash
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
    setAdvances(advances.filter(a => a.id !== advanceToDelete.id));
    toast({
      title: "Advance Deleted",
      description: `Advance of ${advanceToDelete.amount} for ${getLaborerName(advanceToDelete.laborerId)} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (advance: AdvancePayment) => {
    if (editingAdvance) {
      setAdvances(advances.map(a => a.id === advance.id ? advance : a));
      toast({ title: "Advance Updated", description: `Advance for ${getLaborerName(advance.laborerId)} has been updated.` });
    } else {
      setAdvances([advance, ...advances]);
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
      cell: (item: AdvancePayment) => `$${item.amount.toFixed(2)}`
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Advance Payments</h1>
        <Button onClick={handleAddAdvance} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Record Advance
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={advances}
        onEdit={handleEditAdvance}
        onDelete={handleDeleteAdvance}
      />

      <AdvanceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAdvance(undefined);
        }}
        onSubmit={handleFormSubmit}
        laborers={laborers}
        defaultValues={editingAdvance}
      />
    </div>
  );
}
