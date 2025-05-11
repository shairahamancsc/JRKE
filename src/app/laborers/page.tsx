
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LaborerForm } from '@/components/laborers/laborer-form';
import { DataTable } from '@/components/common/data-table';
import type { Laborer } from '@/lib/types';
import { initialLaborers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

export default function LaborersPage() {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLaborer, setEditingLaborer] = useState<Laborer | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data or fetch from an API
    setLaborers(initialLaborers);
    
    // Check for #add in URL to open form
    if (window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; // Clear hash
    }
  }, []);

  const handleAddLaborer = () => {
    setEditingLaborer(undefined);
    setIsFormOpen(true);
  };

  const handleEditLaborer = (laborer: Laborer) => {
    setEditingLaborer(laborer);
    setIsFormOpen(true);
  };

  const handleDeleteLaborer = (laborerToDelete: Laborer) => {
    setLaborers(laborers.filter(l => l.id !== laborerToDelete.id));
    toast({
      title: "Laborer Deleted",
      description: `${laborerToDelete.name} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (laborer: Laborer) => {
    if (editingLaborer) {
      setLaborers(laborers.map(l => l.id === laborer.id ? laborer : l));
      toast({ title: "Laborer Updated", description: `${laborer.name}'s details have been updated.` });
    } else {
      setLaborers([laborer, ...laborers]);
      toast({ title: "Laborer Added", description: `${laborer.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingLaborer(undefined);
  };

  const columns = [
    { accessorKey: 'name' as keyof Laborer, header: 'Name' },
    { accessorKey: 'details' as keyof Laborer, header: 'Details' },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Laborer Management</h1>
        <Button onClick={handleAddLaborer} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Laborer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={laborers}
        onEdit={handleEditLaborer}
        onDelete={handleDeleteLaborer}
      />

      <LaborerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLaborer(undefined);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={editingLaborer}
      />
    </div>
  );
}
