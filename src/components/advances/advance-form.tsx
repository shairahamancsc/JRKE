
"use client";

import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AdvancePayment, Laborer, PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'account', label: 'Account Pay' },
];

const advanceSchema = z.object({
  laborerId: z.string().min(1, "Laborer is required"),
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  paymentMethod: z.enum(['phonepe', 'account', 'cash']).optional(),
  remarks: z.string().optional(),
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
      paymentMethod: defaultValues?.paymentMethod || undefined,
      remarks: defaultValues?.remarks || '',
    },
  });

  const selectedDate = watch('date');

  React.useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        reset({
          laborerId: defaultValues.laborerId,
          date: parseISO(defaultValues.date),
          amount: defaultValues.amount,
          paymentMethod: defaultValues.paymentMethod || undefined,
          remarks: defaultValues.remarks || '',
        });
      } else {
        reset({
          laborerId: '',
          date: new Date(),
          amount: 0,
          paymentMethod: undefined,
          remarks: '',
        });
      }
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Advance' : 'Record New Advance'}</DialogTitle>
          <DialogDescription>
            Fill in the details for the advance payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-2">
          <div>
            <Label htmlFor="laborerId">Laborer</Label>
            <Controller
              name="laborerId"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ""} // Control with empty string for placeholder
                >
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
                      id="date" 
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
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} className={errors.amount ? 'border-destructive' : ''} />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ""}  // Control with empty string for placeholder
                >
                  <SelectTrigger id="paymentMethod" className={errors.paymentMethod ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">-- None --</SelectItem>  Removed to fix error */}
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && <p className="text-xs text-destructive mt-1">{errors.paymentMethod.message}</p>}
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea 
              id="remarks" 
              {...register('remarks')} 
              placeholder="Add any remarks for this advance" 
              className={errors.remarks ? 'border-destructive' : ''} 
              rows={3}
            />
            {errors.remarks && <p className="text-xs text-destructive mt-1">{errors.remarks.message}</p>}
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

