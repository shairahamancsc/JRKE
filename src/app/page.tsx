
"use client"; 

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, IndianRupee, ClipboardList, PlusCircle, ArrowRight, ClipboardCheck, CalendarIcon, UserCircle2 } from 'lucide-react';
import { initialLabours, initialAdvancePayments, initialWorkLogs, initialDailyLogEntries } from '@/lib/data'; 
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LABOURS_STORAGE_KEY, ADVANCES_STORAGE_KEY, WORK_LOGS_STORAGE_KEY, DAILY_ENTRIES_STORAGE_KEY } from '@/lib/storageKeys';
import type { Labour, AdvancePayment, WorkLog, DailyLogEntry } from '@/lib/types';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [labourCount, setLabourCount] = useState(0);
  const [advanceCount, setAdvanceCount] = useState(0);
  const [workLogCount, setWorkLogCount] = useState(0);
  const [allDailyEntries, setAllDailyEntries] = useState<DailyLogEntry[]>([]);
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<DailyLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      setLabourCount(storedLabours ? (JSON.parse(storedLabours) as Labour[]).length : initialLabours.length);

      const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
      setAdvanceCount(storedAdvances ? (JSON.parse(storedAdvances) as AdvancePayment[]).length : initialAdvancePayments.length);
      
      const storedWorkLogs = localStorage.getItem(WORK_LOGS_STORAGE_KEY);
      setWorkLogCount(storedWorkLogs ? (JSON.parse(storedWorkLogs) as WorkLog[]).length : initialWorkLogs.length);

      const storedDailyEntries = localStorage.getItem(DAILY_ENTRIES_STORAGE_KEY);
      const parsedDailyEntries = storedDailyEntries ? (JSON.parse(storedDailyEntries) as DailyLogEntry[]) : initialDailyLogEntries;
      setAllDailyEntries(parsedDailyEntries);

    } catch (error) {
      console.error("Error loading dashboard data from localStorage:", error);
      setLabourCount(initialLabours.length);
      setAdvanceCount(initialAdvancePayments.length);
      setWorkLogCount(initialWorkLogs.length);
      setAllDailyEntries(initialDailyLogEntries);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (searchDate && allDailyEntries.length > 0) {
      const selectedDateStr = format(searchDate, 'yyyy-MM-dd');
      const filtered = allDailyEntries.filter(entry => {
        try {
          return format(parseISO(entry.date), 'yyyy-MM-dd') === selectedDateStr;
        } catch (e) {
          console.error("Error parsing entry date:", entry.date, e);
          return false;
        }
      });
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries([]); 
    }
  }, [searchDate, allDailyEntries]);


  const summaryCards = useMemo(() => [
    { title: "Total Labours", value: labourCount, icon: Users, href: "/labours", color: "text-primary" },
    { title: "Total Advances", value: advanceCount, icon: IndianRupee, href: "/advances", color: "text-accent" },
    { title: "Work Logs Entries", value: workLogCount, icon: ClipboardList, href: "/work-logs", color: "text-secondary-foreground" },
  ], [labourCount, advanceCount, workLogCount]);

  const quickLinks = useMemo(() => [
    { title: "Add New Labour", href: "/labours#add", icon: PlusCircle },
    { title: "Record Advance", href: "/advances#add", icon: PlusCircle },
    { title: "Daily Labour Entries", href: "/daily-entry#add", icon: ClipboardCheck }, 
    { title: "Generate Report", href: "/reports", icon: ArrowRight },
  ], []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <ThemeToggle />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                 <div className="h-5 w-5 bg-muted rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {summaryCards.map((card, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <Link href={card.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View All
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Link href={link.href} key={index} passHref>
            <Button variant="outline" className="w-full h-20 justify-start p-4 text-left shadow-sm hover:shadow-md transition-shadow duration-300 bg-card hover:bg-accent/10">
              <link.icon className="h-6 w-6 mr-3 text-primary" />
              <span className="text-md font-medium text-card-foreground">{link.title}</span>
            </Button>
          </Link>
        ))}
      </div>

      <Card className="mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Search Daily Attendance</CardTitle>
          <CardDescription>Select a date to view attendance records for that day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Label htmlFor="attendance-date-picker" className="text-sm font-medium whitespace-nowrap">Select Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="attendance-date-picker"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-auto sm:min-w-[280px] justify-start text-left font-normal",
                    !searchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={setSearchDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {searchDate && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Attendance for {format(searchDate, "PPP")}
              </h3>
              {isLoading ? ( 
                <p className="text-muted-foreground">Loading entries...</p>
              ) : filteredEntries.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 rounded-md border p-4 bg-background/50">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="p-3 bg-card shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={entry.labourPhotoPreview} alt={entry.labourName || "Labour"} data-ai-hint="person face" />
                            <AvatarFallback>
                              {entry.labourName && entry.labourName.length > 0 ? entry.labourName.charAt(0).toUpperCase() : <UserCircle2 className="h-5 w-5 text-muted-foreground" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium text-sm truncate" title={entry.labourName || 'Unknown Labour'}>{entry.labourName || 'Unknown Labour'}</p>
                            {entry.attendanceStatus === 'present' && entry.workLocation && (
                              <p className="text-xs text-muted-foreground truncate" title={entry.workLocation}>
                                Location: {entry.workLocation}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={entry.attendanceStatus === 'present' ? 'default' : 'secondary'}
                          className={`whitespace-nowrap flex-shrink-0 ${entry.attendanceStatus === 'present' ? 
                                      'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40 dark:hover:bg-green-700/40' : 
                                      'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40 dark:hover:bg-red-700/40'}`}
                        >
                          {entry.attendanceStatus.charAt(0).toUpperCase() + entry.attendanceStatus.slice(1)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No attendance records found for this date.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
