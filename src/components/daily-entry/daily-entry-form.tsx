
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
import type { DailyLogEntry, Laborer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

const individualLaborerDailyEntrySchema = z.object({
  laborerId: z.string(),
  laborerName: z.string(), // For display
  laborerPhotoPreview: z.string().optional(), // For display
  attendanceStatus: z.enum(['present', 'absent'], { required_error: "Attendance status is required" }),
  advanceAmount: z.coerce.number().min(0.01, "Advance must be a positive amount if entered.").optional().or(z.literal('')),
  // workLocation is removed from here
});

const bulkDailyLogEntriesSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  workLocation: z.string().optional(), // Global work location
  entries: z.array(individualLaborerDailyEntrySchema),
}).refine(data => {
  const anyPresent = data.entries.some(entry => entry.attendanceStatus === 'present');
  if (anyPresent && (!data.workLocation || data.workLocation.trim() === '')) {
    return false; 
  }
  return true;
}, {
  message: "Work location is required if at least one laborer is present.",
  path: ["workLocation"], 
});

export type BulkDailyLogEntriesFormData = z.infer<typeof bulkDailyLogEntriesSchema>;

interface DailyEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BulkDailyLogEntriesFormData) => void;
  laborers: Laborer[];
}

export function DailyEntryForm({ isOpen, onClose, onSubmit, laborers }: DailyEntryFormProps) {
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
  const isAnyLaborerPresent = watchedEntries?.some(entry => entry.attendanceStatus === 'present');


  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date(),
        workLocation: '',
        entries: laborers.map(laborer => ({
          laborerId: laborer.id,
          laborerName: laborer.name || 'Unknown Laborer',
          laborerPhotoPreview: laborer.photoPreview,
          attendanceStatus: 'present',
          advanceAmount: undefined,
        })),
      });
    }
  }, [isOpen, laborers, reset]);

  const handleFormSubmit: SubmitHandler<BulkDailyLogEntriesFormData> = (data) => {
    const processedData = {
      ...data,
      entries: data.entries.map(entry => ({
        ...entry,
        advanceAmount: entry.advanceAmount === '' ? undefined : Number(entry.advanceAmount),
      })),
    };
    onSubmit(processedData);
    onClose();
  };
  
  const watchedEntryAttendanceStatus = watch('entries');


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Daily Logs for All Laborers</DialogTitle>
          <DialogDescription>
            Select the date, provide a common work location if any laborers are present, and then mark attendance and advances for each laborer.
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
                disabled={!isAnyLaborerPresent}
              />
              {errors.workLocation && <p className="text-xs text-destructive mt-1">{errors.workLocation.message}</p>}
              {!isAnyLaborerPresent && <p className="text-xs text-muted-foreground mt-1">Enable by marking at least one laborer as present.</p>}
            </div>
          </div>


          <ScrollArea className="h-[45vh] pr-3 border rounded-md">
            <div className="space-y-6 p-4">
              {fields.map((field, index) => {
                const currentAttendanceStatus = watchedEntryAttendanceStatus?.[index]?.attendanceStatus;
                return (
                  <Card key={field.id} className="p-4 shadow-sm bg-card">
                    <div className="flex items-center mb-3">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={field.laborerPhotoPreview} alt={field.laborerName} data-ai-hint="person" />
                        <AvatarFallback><UserCircle2 className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-medium text-card-foreground">{field.laborerName}</h3>
                    </div>

                    <input type="hidden" {...control.register(`entries.${index}.laborerId`)} />

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
                                // Trigger re-evaluation of isAnyLaborerPresent
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
                        <Label htmlFor={`advanceAmount-${field.id}`} className="text-sm font-medium">Advance Amount (Optional)</Label>
                        <Input 
                          id={`advanceAmount-${field.id}`}
                          type="number" 
                          step="0.01" 
                          {...control.register(`entries.${index}.advanceAmount`)}
                          className={errors.entries?.[index]?.advanceAmount ? 'border-destructive' : ''}
                          placeholder="e.g., 100.00"
                        />
                        {errors.entries?.[index]?.advanceAmount && <p className="text-xs text-destructive mt-1">{errors.entries?.[index]?.advanceAmount?.message}</p>}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
          
          {errors.entries && typeof errors.entries === 'string' && <p className="text-xs text-destructive mt-1">{errors.entries.message}</p>}


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
