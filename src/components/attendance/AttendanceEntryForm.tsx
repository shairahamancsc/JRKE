"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AttendanceSchema, type AttendanceFormData } from "@/lib/schemas";
import type { Laborer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CheckCircle, XCircle, MinusCircle, Save } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AttendanceEntryFormProps {
  laborers: Laborer[]; 
  onSuccess?: (data: AttendanceFormData) => void;
}

export function AttendanceEntryForm({ laborers, onSuccess }: AttendanceEntryFormProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      date: selectedDate || new Date(),
      attendance: laborers.map(laborer => ({
        laborerId: laborer.id,
        status: 'present', 
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "attendance",
  });

  useEffect(() => {
    form.setValue('date', selectedDate || new Date());
    form.setValue('attendance', laborers.map(laborer => ({
        laborerId: laborer.id,
        status: 'present', 
      })), { shouldValidate: true, shouldDirty: true });
  }, [laborers, selectedDate, form]);


  function onSubmit(data: AttendanceFormData) {
    console.log("Attendance data:", data);
    toast({
      title: "Attendance Recorded",
      description: `Attendance for ${format(data.date, "PPP")} has been successfully recorded.`,
    });
    if (onSuccess) {
      onSuccess(data);
    }
  }

  const getLaborerData = (laborerId: string) => {
    return laborers.find(l => l.id === laborerId);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <CalendarIcon className="mr-2 h-6 w-6 text-primary" /> Date Selection
            </CardTitle>
            <CardDescription>Select the date for which attendance is being recorded.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Attendance Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full sm:w-[280px] justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold font-headline text-primary">Laborer Attendance Status</h3>
          {fields.map((item, index) => {
            const laborer = getLaborerData(item.laborerId);
            return (
            <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={laborer?.profilePhotoUrl || `https://placehold.co/40x40.png?text=${laborer?.name.charAt(0)}`} alt={laborer?.name} data-ai-hint="person initial"/>
                            <AvatarFallback>{laborer?.name.charAt(0).toUpperCase() || 'L'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{laborer?.name || "Unknown Laborer"}</span>
                    </div>
                  <Controller
                    control={form.control}
                    name={`attendance.${index}.status`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="present">
                            <CheckCircle className="inline-block mr-2 h-4 w-4 text-green-500" /> Present
                          </SelectItem>
                          <SelectItem value="absent">
                            <XCircle className="inline-block mr-2 h-4 w-4 text-red-500" /> Absent
                          </SelectItem>
                          <SelectItem value="leave">
                            <MinusCircle className="inline-block mr-2 h-4 w-4 text-yellow-500" /> On Leave
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                 <FormMessage>{form.formState.errors.attendance?.[index]?.status?.message}</FormMessage>
              </CardContent>
            </Card>
          )})}
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting || laborers.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? "Saving..." : "Save Attendance"}
        </Button>
        {laborers.length === 0 && <p className="text-sm text-destructive">No laborers available to mark attendance.</p>}
      </form>
    </Form>
  );
}
