
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/data-table';
import { IndianRupee, CalendarIcon, AlertTriangle, Loader2, Wallet, Scale } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import type { Labour, DailyLogEntry, AdvancePayment, PayrollRow } from '@/lib/types';
import { LABOURS_STORAGE_KEY, DAILY_ENTRIES_STORAGE_KEY, ADVANCES_STORAGE_KEY } from '@/lib/storageKeys';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { initialLabours, initialDailyLogEntries, initialAdvancePayments } from '@/lib/data'; // For fallback

export default function PayrollPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>({});
  const [payrollData, setPayrollData] = useState<PayrollRow[]>([]);
  const [totalNetPayable, setTotalNetPayable] = useState<number>(0);
  const [labours, setLabours] = useState<Labour[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyLogEntry[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calculationDone, setCalculationDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      setLabours(storedLabours ? JSON.parse(storedLabours) : initialLabours);

      const storedDailyEntries = localStorage.getItem(DAILY_ENTRIES_STORAGE_KEY);
      setDailyEntries(storedDailyEntries ? JSON.parse(storedDailyEntries) : initialDailyLogEntries);

      const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
      setAdvances(storedAdvances ? JSON.parse(storedAdvances) : initialAdvancePayments);
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast({ title: "Error", description: "Could not load data from storage.", variant: "destructive" });
      setLabours(initialLabours);
      setDailyEntries(initialDailyLogEntries);
      setAdvances(initialAdvancePayments);
    }
  }, [toast]);

  const handleCalculatePayroll = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({ title: "Select Date Range", description: "Please select a valid start and end date.", variant: "destructive" });
      return;
    }
    if (dateRange.from > dateRange.to) {
      toast({ title: "Invalid Date Range", description: "Start date cannot be after end date.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setCalculationDone(false);
    setTotalNetPayable(0); // Reset total

    const interval = {
      start: startOfDay(dateRange.from),
      end: endOfDay(dateRange.to),
    };

    let currentTotalNetPayable = 0;

    const calculatedData: PayrollRow[] = labours
      .filter(labour => typeof labour.salaryRate === 'number' && labour.salaryRate > 0)
      .map(labour => {
        const presentDays = dailyEntries.filter(entry =>
          entry.labourId === labour.id &&
          entry.attendanceStatus === 'present' &&
          isWithinInterval(parseISO(entry.date), interval)
        ).length;

        const grossSalary = presentDays * (labour.salaryRate || 0);

        const totalAdvances = advances.filter(advance =>
          advance.labourId === labour.id &&
          isWithinInterval(parseISO(advance.date), interval)
        ).reduce((sum, advance) => sum + advance.amount, 0);

        const netPayable = grossSalary - totalAdvances;
        currentTotalNetPayable += netPayable;

        return {
          labourId: labour.id,
          labourName: labour.name,
          salaryRate: labour.salaryRate || 0,
          presentDays,
          grossSalary,
          totalAdvances,
          netPayable,
        };
      });

    setPayrollData(calculatedData);
    setTotalNetPayable(currentTotalNetPayable);
    setIsLoading(false);
    setCalculationDone(true);

    if (calculatedData.length === 0) {
        const unconfiguredLabours = labours.filter(l => typeof l.salaryRate !== 'number' || l.salaryRate <= 0).length;
        if (unconfiguredLabours > 0 && labours.length > 0) {
            toast({ title: "No Data Calculated", description: `No labours with valid salary rates found, or no attendance in the selected period. Please set salary rates for labours.`, variant: "default" });
        } else if (labours.length === 0) {
             toast({ title: "No Labours", description: "No labours found. Please add labours first.", variant: "default" });
        } else {
            toast({ title: "No Data Calculated", description: "No attendance records found for the selected period or no labours with valid salary rates.", variant: "default" });
        }
    }
  };
  
  const columns = useMemo(() => [
    { accessorKey: 'labourName' as keyof PayrollRow, header: 'Labour Name' },
    { 
      accessorKey: 'salaryRate' as keyof PayrollRow, 
      header: 'Daily Rate',
      cell: (item: PayrollRow) => `₹${item.salaryRate.toFixed(2)}`
    },
    { accessorKey: 'presentDays' as keyof PayrollRow, header: 'Present Days' },
    { 
      accessorKey: 'grossSalary' as keyof PayrollRow, 
      header: 'Gross Salary',
      cell: (item: PayrollRow) => `₹${item.grossSalary.toFixed(2)}`
    },
    { 
      accessorKey: 'totalAdvances' as keyof PayrollRow, 
      header: 'Total Advances',
      cell: (item: PayrollRow) => `₹${item.totalAdvances.toFixed(2)}`
    },
    { 
      accessorKey: 'netPayable' as keyof PayrollRow, 
      header: 'Net Payable',
      cell: (item: PayrollRow) => (
        <span className={cn(item.netPayable < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400', 'font-semibold')}>
          ₹{item.netPayable.toFixed(2)}
        </span>
      )
    },
  ], []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Labour Payroll Calculator</CardTitle>
          </div>
          <CardDescription>Calculate net payable salary for labours based on attendance and advances within a selected date range.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full sm:min-w-[300px] justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
            </div>
            <Button 
              onClick={handleCalculatePayroll} 
              disabled={isLoading || !dateRange?.from || !dateRange?.to}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IndianRupee className="mr-2 h-4 w-4" />}
              Calculate Payroll
            </Button>
          </div>
           {labours.filter(l => typeof l.salaryRate !== 'number' || l.salaryRate <= 0).length > 0 && (
             <div className="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>Some labours do not have a valid daily salary rate set. Their payroll cannot be calculated. Please update their profiles in the <a href="/labours" className="underline font-medium hover:text-yellow-600 dark:hover:text-yellow-200">Labours section</a>.</span>
             </div>
           )}
        </CardContent>
      </Card>

      {calculationDone && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Payroll Results</CardTitle>
            {dateRange?.from && dateRange?.to && (
                 <CardDescription>
                    Showing payroll for the period: {format(dateRange.from, "PPP")} to {format(dateRange.to, "PPP")}.
                 </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Calculating...</span>
              </div>
            ) : payrollData.length > 0 ? (
              <DataTable columns={columns} data={payrollData} />
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No payroll data to display for the selected criteria. Ensure labours have salary rates and there are attendance records in this period.
              </p>
            )}
          </CardContent>
           {payrollData.length > 0 && !isLoading && (
            <CardFooter className="flex flex-col sm:flex-row justify-end items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Scale className="h-6 w-6 text-primary" />
                    <span>Total Net Payable:</span>
                    <span className={cn(totalNetPayable < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400')}>
                        ₹{totalNetPayable.toFixed(2)}
                    </span>
                </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

