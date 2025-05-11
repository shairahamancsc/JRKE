
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";
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
  photoFile: z.instanceof(File).optional(),
});

type LaborerFormData = z.infer<typeof laborerSchema>;

interface LaborerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Laborer) => void;
  defaultValues?: Laborer;
}

export function LaborerForm({ isOpen, onClose, onSubmit, defaultValues }: LaborerFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(defaultValues?.photoPreview);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LaborerFormData>({
    resolver: zodResolver(laborerSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      details: defaultValues?.details || '',
      photoFile: undefined,
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      reset({ 
        name: defaultValues.name, 
        details: defaultValues.details,
        photoFile: undefined, // File objects cannot be reliably set in defaultValues
      });
      setPhotoPreview(defaultValues.photoPreview);
    } else {
      reset({ name: '', details: '', photoFile: undefined });
      setPhotoPreview(undefined);
    }
  }, [defaultValues, reset, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('photoFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue('photoFile', undefined);
      // If defaultValues had a preview, keep it if user cancels file selection
      setPhotoPreview(defaultValues?.photoPreview); 
    }
  };

  const handleFormSubmit: SubmitHandler<LaborerFormData> = (data) => {
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      name: data.name,
      details: data.details,
      photoFile: data.photoFile,
      photoPreview: data.photoFile ? photoPreview : defaultValues?.photoPreview, // Keep existing preview if no new file
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Reset preview to default when closing if not submitting
        setPhotoPreview(defaultValues?.photoPreview);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Laborer' : 'Add New Laborer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-2">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview} alt={defaultValues?.name || "Laborer photo"} data-ai-hint="person portrait" />
              <AvatarFallback>
                <UserCircle2 className="h-16 w-16 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photoFile" className="text-sm font-medium text-primary hover:underline cursor-pointer">
              {photoPreview ? "Change Photo" : "Upload Photo"}
            </Label>
            <Input 
              id="photoFile" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden"
            />
             {errors.photoFile && <p className="text-xs text-destructive mt-1">{errors.photoFile.message}</p>}
          </div>

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
