
"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Laborer } from '@/lib/types';

const laborerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  details: z.string().min(1, "Details are required"),
});

type LaborerFormData = z.infer<typeof laborerSchema>;

interface LaborerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Laborer) => void;
  defaultValues?: Laborer;
}

export function LaborerForm({ isOpen, onClose, onSubmit, defaultValues }: LaborerFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LaborerFormData>({
    resolver: zodResolver(laborerSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      details: defaultValues?.details || '',
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      reset({ name: defaultValues.name, details: defaultValues.details });
    } else {
      reset({ name: '', details: '' });
    }
  }, [defaultValues, reset, isOpen]);

  const handleFormSubmit: SubmitHandler<LaborerFormData> = (data) => {
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      ...data,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Laborer' : 'Add New Laborer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" {...register('details')} className={errors.details ? 'border-destructive' : ''} />
            {errors.details && <p className="text-xs text-destructive mt-1">{errors.details.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {defaultValues ? 'Save Changes' : 'Add Laborer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
