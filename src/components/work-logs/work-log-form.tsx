
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, UploadCloud } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { WorkLog, Labour } from '@/lib/types';
import { cn } from '@/lib/utils';

const workLogSchema = z.object({
  labourId: z.string().min(1, "Labour is required"),
  date: z.date({ required_error: "Date is required" }),
  location: z.string().min(1, "Location is required"),
  workType: z.string().min(1, "Type of work is required"),
  pictureFile: z.instanceof(File).optional(),
});

type WorkLogFormData = z.infer<typeof workLogSchema>;

interface WorkLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkLog) => void;
  labours: Labour[];
  defaultValues?: WorkLog;
}

export function WorkLogForm({ isOpen, onClose, onSubmit, labours, defaultValues }: WorkLogFormProps) {
  const [picturePreview, setPicturePreview] = useState<string | undefined>(defaultValues?.picturePreview);
  
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<WorkLogFormData>({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      labourId: defaultValues?.labourId || '',
      date: defaultValues?.date ? parseISO(defaultValues.date) : new Date(),
      location: defaultValues?.location || '',
      workType: defaultValues?.workType || '',
      pictureFile: undefined,
    },
  });

  const selectedDate = watch('date');

  React.useEffect(() => {
    if (defaultValues) {
      reset({
        labourId: defaultValues.labourId,
        date: parseISO(defaultValues.date),
        location: defaultValues.location,
        workType: defaultValues.workType,
        pictureFile: undefined, // File objects cannot be reliably set in defaultValues
      });
      setPicturePreview(defaultValues.picturePreview);
    } else {
      reset({
        labourId: '',
        date: new Date(),
        location: '',
        workType: '',
        pictureFile: undefined,
      });
      setPicturePreview(undefined);
    }
  }, [defaultValues, reset, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('pictureFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setValue('pictureFile', undefined);
        setPicturePreview(undefined);
    }
  };

  const handleFormSubmit: SubmitHandler<WorkLogFormData> = (data) => {
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      labourId: data.labourId,
      date: data.date.toISOString(),
      location: data.location,
      workType: data.workType,
      pictureFile: data.pictureFile,
      picturePreview: data.pictureFile ? picturePreview : defaultValues?.picturePreview, // Keep existing preview if no new file
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Work Log' : 'Add New Work Log'}</DialogTitle>
          <DialogDescription>
            Please fill in the work log details below. All required fields are marked.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-2">
          <div>
            <Label htmlFor="labourId">Labour</Label>
            <Controller
              name="labourId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="labourId" className={errors.labourId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a labour" />
                  </SelectTrigger>
                  <SelectContent>
                    {labours.map(labour => (
                      <SelectItem key={labour.id} value={labour.id}>
                        {labour.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.labourId && <p className="text-xs text-destructive mt-1">{errors.labourId.message}</p>}
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
                      id="date" // Added id to match Label htmlFor
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
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} className={errors.location ? 'border-destructive' : ''} />
            {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <Label htmlFor="workType">Type of Work</Label>
            <Textarea id="workType" {...register('workType')} className={errors.workType ? 'border-destructive' : ''} />
            {errors.workType && <p className="text-xs text-destructive mt-1">{errors.workType.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="pictureFile">Timestamped Picture (Optional)</Label>
            <Input id="pictureFile" type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary file:font-semibold"/>
            {picturePreview && (
              <div className="mt-2">
                <Image src={picturePreview} alt="Picture preview" width={100} height={100} className="rounded-md object-cover" data-ai-hint="construction site" />
              </div>
            )}
            {errors.pictureFile && <p className="text-xs text-destructive mt-1">{errors.pictureFile.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {defaultValues ? 'Save Changes' : 'Add Work Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
