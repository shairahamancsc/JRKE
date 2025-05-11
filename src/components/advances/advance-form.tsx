
"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { AdvancePayment, Laborer } from '@/lib/types';
import { cn } from '@/lib/utils';

const advanceSchema = z.object({
  laborerId: z.string().min(1, "Laborer is required"),
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
});

type AdvanceFormData = z.infer<typeof advanceSchema>;

interface AdvanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdvancePayment) => void;
  laborers: Laborer[];
  defaultValues?: AdvancePayment;
}

export function AdvanceForm({ isOpen, onClose, onSubmit, laborers, defaultValues }: AdvanceFormProps) {
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      laborerId: defaultValues?.laborerId || '',
      date: defaultValues?.date ? parseISO(defaultValues.date) : new Date(),
      amount: defaultValues?.amount || 0,
    },
  });

  const selectedDate = watch('date');

  React.useEffect(() => {
    if (defaultValues) {
      reset({
        laborerId: defaultValues.laborerId,
        date: parseISO(defaultValues.date),
        amount: defaultValues.amount,
      });
    } else {
      reset({
        laborerId: '',
        date: new Date(),
        amount: 0,
      });
    }
  }, [defaultValues, reset, isOpen]);

  const handleFormSubmit: SubmitHandler<AdvanceFormData> = (data) => {
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      ...data,
      date: data.date.toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Advance' : 'Record New Advance'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="laborerId">Laborer</Label>
            <Controller
              name="laborerId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="laborerId" className={errors.laborerId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a laborer" />
                  </SelectTrigger>
                  <SelectContent>
                    {laborers.map(laborer => (
                      <SelectItem key={laborer.id} value={laborer.id}>
                        {laborer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.laborerId && <p className="text-xs text-destructive mt-1">{errors.laborerId.message}</p>}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        errors.date ? 'border-destructive' : ''
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => date && field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
             {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} className={errors.amount ? 'border-destructive' : ''} />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {defaultValues ? 'Save Changes' : 'Record Advance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Need to add Controller for react-hook-form with shadcn Select and Calendar
import { Controller } from 'react-hook-form';
