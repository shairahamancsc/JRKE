
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, UserCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { DailyLogEntry, Laborer } from '@/lib/types';
import { cn } from '@/lib/utils';

const dailyLogEntrySchema = z.object({
  laborerId: z.string().min(1, "Laborer is required"),
  date: z.date({ required_error: "Date is required" }),
  attendanceStatus: z.enum(['present', 'absent'], { required_error: "Attendance status is required" }),
  advanceAmount: z.coerce.number().min(0.01, "Advance must be a positive amount if entered.").optional(),
  workLocation: z.string().optional(),
})
.refine(data => {
    if (data.attendanceStatus === 'present' && (!data.workLocation || data.workLocation.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "Work location is required if laborer is present.",
    path: ["workLocation"],
});

type DailyLogEntryFormData = z.infer<typeof dailyLogEntrySchema>;

interface DailyLogEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DailyLogEntry) => void;
  laborers: Laborer[];
  defaultValues?: DailyLogEntry;
}

export function DailyEntryForm({ isOpen, onClose, onSubmit, laborers, defaultValues }: DailyLogEntryFormProps) {
  const [selectedLaborerPhoto, setSelectedLaborerPhoto] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<DailyLogEntryFormData>({
    resolver: zodResolver(dailyLogEntrySchema),
    defaultValues: {
      laborerId: defaultValues?.laborerId || '',
      date: defaultValues?.date ? parseISO(defaultValues.date) : new Date(),
      attendanceStatus: defaultValues?.attendanceStatus || 'present',
      advanceAmount: defaultValues?.advanceAmount || undefined,
      workLocation: defaultValues?.workLocation || '',
    },
  });

  const watchedLaborerId = watch('laborerId');
  const watchedAttendanceStatus = watch('attendanceStatus');
  const selectedDate = watch('date');

  useEffect(() => {
    if (defaultValues) {
      reset({
        laborerId: defaultValues.laborerId,
        date: parseISO(defaultValues.date),
        attendanceStatus: defaultValues.attendanceStatus,
        advanceAmount: defaultValues.advanceAmount,
        workLocation: defaultValues.workLocation,
      });
      const laborer = laborers.find(l => l.id === defaultValues.laborerId);
      setSelectedLaborerPhoto(laborer?.photoPreview);
    } else {
      reset({
        laborerId: '',
        date: new Date(),
        attendanceStatus: 'present',
        advanceAmount: undefined,
        workLocation: '',
      });
      setSelectedLaborerPhoto(undefined);
    }
  }, [defaultValues, reset, isOpen, laborers]);

  useEffect(() => {
    if (watchedLaborerId) {
      const laborer = laborers.find(l => l.id === watchedLaborerId);
      setSelectedLaborerPhoto(laborer?.photoPreview);
    } else {
      setSelectedLaborerPhoto(undefined);
    }
  }, [watchedLaborerId, laborers]);
  
  // Clear workLocation if absent
  useEffect(() => {
    if (watchedAttendanceStatus === 'absent') {
      setValue('workLocation', '');
    }
  }, [watchedAttendanceStatus, setValue]);

  const handleFormSubmit: SubmitHandler<DailyLogEntryFormData> = (data) => {
    const selectedLaborer = laborers.find(l => l.id === data.laborerId);
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      ...data,
      date: data.date.toISOString(),
      advanceAmount: data.advanceAmount || undefined, // Ensure undefined if not provided
      workLocation: data.attendanceStatus === 'present' ? data.workLocation : undefined, // Clear location if absent
      laborerName: selectedLaborer?.name,
      laborerPhotoPreview: selectedLaborer?.photoPreview,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Daily Log' : 'Add Daily Log'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-2">
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
            {selectedLaborerPhoto && (
              <Avatar className="h-16 w-16 mt-2">
                <AvatarImage src={selectedLaborerPhoto} alt="Laborer photo" data-ai-hint="person" />
                <AvatarFallback><UserCircle2 className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
              </Avatar>
            )}
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
            <Label>Attendance Status</Label>
            <Controller
              name="attendanceStatus"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id="present" />
                    <Label htmlFor="present">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id="absent" />
                    <Label htmlFor="absent">Absent</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.attendanceStatus && <p className="text-xs text-destructive mt-1">{errors.attendanceStatus.message}</p>}
          </div>
          
          {watchedAttendanceStatus === 'present' && (
            <div>
              <Label htmlFor="workLocation">Work Location</Label>
              <Textarea 
                id="workLocation" 
                {...register('workLocation')} 
                className={errors.workLocation ? 'border-destructive' : ''}
                placeholder="Enter work location/details"
              />
              {errors.workLocation && <p className="text-xs text-destructive mt-1">{errors.workLocation.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="advanceAmount">Advance Amount (Optional)</Label>
            <Input 
              id="advanceAmount" 
              type="number" 
              step="0.01" 
              {...register('advanceAmount')} 
              className={errors.advanceAmount ? 'border-destructive' : ''}
              placeholder="e.g., 100.00"
            />
            {errors.advanceAmount && <p className="text-xs text-destructive mt-1">{errors.advanceAmount.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {defaultValues ? 'Save Changes' : 'Save Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
