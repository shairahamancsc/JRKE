
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { DailyLogEntry, Labour, PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

const paymentMethodsList: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'account', label: 'Account Pay' },
];

const individualLabourDailyEntrySchema = z.object({
  labourId: z.string(),
  labourName: z.string(), 
  labourPhotoPreview: z.string().optional(), 
  attendanceStatus: z.enum(['present', 'absent'], { required_error: "Attendance status is required" }),
  advanceAmount: z.coerce.number().min(0, "Advance must be a non-negative amount.").optional().or(z.literal('')),
  advancePaymentMethod: z.enum(['phonepe', 'account', 'cash']).optional(),
  advanceRemarks: z.string().optional(),
});

const bulkDailyLogEntriesSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  workLocation: z.string().optional(), 
  entries: z.array(individualLabourDailyEntrySchema),
}).refine(data => {
  const anyPresent = data.entries.some(entry => entry.attendanceStatus === 'present');
  if (anyPresent && (!data.workLocation || data.workLocation.trim() === '')) {
    return false; 
  }
  return true;
}, {
  message: "Work location is required if at least one labour is present.",
  path: ["workLocation"], 
}).refine(data => {
    for (const entry of data.entries) {
        if (entry.advanceAmount && Number(entry.advanceAmount) > 0 && !entry.advancePaymentMethod) {
            // This custom pathing is a bit tricky with useFieldArray, focusing on a general error for now.
            // For specific field error, you might need more complex logic or a different validation approach.
            return false; 
        }
    }
    return true;
}, {
    message: "Payment method is required if advance amount is greater than 0.",
    // Path ideally would be `entries.${index}.advancePaymentMethod`, but Zod's refine path doesn't easily support dynamic indices.
    // A general error or per-field validation might be more practical here.
    // For simplicity, showing a general error at the 'entries' level.
    path: ["entries"], 
});


export type BulkDailyLogEntriesFormData = z.infer<typeof bulkDailyLogEntriesSchema>;

interface DailyEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BulkDailyLogEntriesFormData) => void;
  labours: Labour[];
}

export function DailyEntryForm({ isOpen, onClose, onSubmit, labours }: DailyEntryFormProps) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<BulkDailyLogEntriesFormData>({
    resolver: zodResolver(bulkDailyLogEntriesSchema),
    defaultValues: {
      date: new Date(),
      workLocation: '',
      entries: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const selectedDate = watch('date');
  const watchedEntries = watch('entries');
  const isAnyLabourPresent = watchedEntries?.some(entry => entry.attendanceStatus === 'present');


  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date(),
        workLocation: '',
        entries: labours.map(labour => ({
          labourId: labour.id,
          labourName: labour.name || 'Unknown Labour',
          labourPhotoPreview: labour.photoPreview,
          attendanceStatus: 'present',
          advanceAmount: undefined,
          advancePaymentMethod: undefined,
          advanceRemarks: '',
        })),
      });
    }
  }, [isOpen, labours, reset]);

  const handleFormSubmit: SubmitHandler<BulkDailyLogEntriesFormData> = (data) => {
    const processedData = {
      ...data,
      entries: data.entries.map(entry => ({
        ...entry,
        advanceAmount: entry.advanceAmount === '' ? undefined : Number(entry.advanceAmount),
        advancePaymentMethod: (entry.advanceAmount && Number(entry.advanceAmount) > 0) ? entry.advancePaymentMethod : undefined,
        advanceRemarks: (entry.advanceAmount && Number(entry.advanceAmount) > 0) ? entry.advanceRemarks : undefined,
      })),
    };
    onSubmit(processedData);
    onClose();
  };
  
  const watchedEntryValues = watch('entries');


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Daily Logs for All Labours</DialogTitle>
          <DialogDescription>
            Select the date, provide a common work location if any labours are present, and then mark attendance and advances for each labour.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="workLocation">Common Work Location</Label>
              <Textarea 
                id="workLocation"
                {...control.register(`workLocation`)}
                className={errors.workLocation ? 'border-destructive' : ''}
                placeholder="Enter common work location/details"
                disabled={!isAnyLabourPresent}
              />
              {errors.workLocation && <p className="text-xs text-destructive mt-1">{errors.workLocation.message}</p>}
              {!isAnyLabourPresent && <p className="text-xs text-muted-foreground mt-1">Enable by marking at least one labour as present.</p>}
            </div>
          </div>


          <ScrollArea className="h-[45vh] pr-3 border rounded-md">
            <div className="space-y-6 p-4">
              {fields.map((field, index) => {
                const currentAttendanceStatus = watchedEntryValues?.[index]?.attendanceStatus;
                const currentAdvanceAmount = watchedEntryValues?.[index]?.advanceAmount;
                const showAdvanceDetails = currentAdvanceAmount && Number(currentAdvanceAmount) > 0;

                return (
                  <Card key={field.id} className="p-4 shadow-sm bg-card">
                    <div className="flex items-center mb-3">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={field.labourPhotoPreview} alt={field.labourName} data-ai-hint="person" />
                        <AvatarFallback><UserCircle2 className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-medium text-card-foreground">{field.labourName}</h3>
                    </div>

                    <input type="hidden" {...control.register(`entries.${index}.labourId`)} />

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Attendance Status</Label>
                        <Controller
                          name={`entries.${index}.attendanceStatus`}
                          control={control}
                          render={({ field: controllerField }) => (
                            <RadioGroup
                              onValueChange={(value) => {
                                controllerField.onChange(value);
                                const updatedEntries = [...watchedEntries];
                                updatedEntries[index] = { ...updatedEntries[index], attendanceStatus: value as 'present' | 'absent' };
                                setValue('entries', updatedEntries, { shouldValidate: true });
                              }}
                              defaultValue={controllerField.value}
                              className="flex flex-wrap gap-x-4 gap-y-2 mt-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="present" id={`present-${field.id}`} />
                                <Label htmlFor={`present-${field.id}`} className="font-normal">Present</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="absent" id={`absent-${field.id}`} />
                                <Label htmlFor={`absent-${field.id}`} className="font-normal">Absent</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {errors.entries?.[index]?.attendanceStatus && <p className="text-xs text-destructive mt-1">{errors.entries?.[index]?.attendanceStatus?.message}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor={`advanceAmount-${field.id}`} className="text-sm font-medium">Advance Amount (₹) (Optional)</Label>
                        <Input 
                          id={`advanceAmount-${field.id}`}
                          type="number" 
                          step="0.01" 
                          {...control.register(`entries.${index}.advanceAmount`)}
                          className={errors.entries?.[index]?.advanceAmount ? 'border-destructive' : ''}
                          placeholder="e.g., 100.00"
                          onChange={(e) => {
                            control.setValue(`entries.${index}.advanceAmount`, e.target.value === '' ? '' : parseFloat(e.target.value), { shouldValidate: true });
                            if (e.target.value === '' || parseFloat(e.target.value) <= 0) {
                                control.setValue(`entries.${index}.advancePaymentMethod`, undefined);
                                control.setValue(`entries.${index}.advanceRemarks`, '');
                            }
                          }}
                        />
                        {errors.entries?.[index]?.advanceAmount && <p className="text-xs text-destructive mt-1">{errors.entries?.[index]?.advanceAmount?.message}</p>}
                      </div>

                      {showAdvanceDetails && (
                        <>
                          <div>
                            <Label htmlFor={`advancePaymentMethod-${field.id}`} className="text-sm font-medium">Advance Payment Method</Label>
                            <Controller
                              name={`entries.${index}.advancePaymentMethod`}
                              control={control}
                              render={({ field: controllerField }) => (
                                <Select 
                                  onValueChange={controllerField.onChange} 
                                  defaultValue={controllerField.value}
                                  value={controllerField.value || ""}
                                >
                                  <SelectTrigger id={`advancePaymentMethod-${field.id}`} className={errors.entries?.[index]?.advancePaymentMethod ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethodsList.map(method => (
                                      <SelectItem key={method.value} value={method.value}>
                                        {method.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.entries?.[index]?.advancePaymentMethod && <p className="text-xs text-destructive mt-1">{errors.entries?.[index]?.advancePaymentMethod?.message}</p>}
                          </div>

                          <div>
                            <Label htmlFor={`advanceRemarks-${field.id}`} className="text-sm font-medium">Advance Remarks (Optional)</Label>
                            <Textarea 
                              id={`advanceRemarks-${field.id}`}
                              {...control.register(`entries.${index}.advanceRemarks`)}
                              placeholder="Add any remarks for this advance"
                              className={errors.entries?.[index]?.advanceRemarks ? 'border-destructive' : ''}
                              rows={2}
                            />
                            {errors.entries?.[index]?.advanceRemarks && <p className="text-xs text-destructive mt-1">{errors.entries?.[index]?.advanceRemarks?.message}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
          
          {errors.entries && !Array.isArray(errors.entries) && typeof errors.entries.message === 'string' && (
            <p className="text-sm text-destructive mt-1">{errors.entries.message}</p>
          )}


          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save All Logs
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
