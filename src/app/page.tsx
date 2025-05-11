
"use client"; // Make this a Client Component to use useEffect and localStorage

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, IndianRupee, ClipboardList, PlusCircle, ArrowRight, ClipboardCheck } from 'lucide-react';
import { initialLaborers, initialAdvancePayments, initialWorkLogs } from '@/lib/data'; // Keep for fallback
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LABORERS_STORAGE_KEY, ADVANCES_STORAGE_KEY, WORK_LOGS_STORAGE_KEY } from '@/lib/storageKeys';
import type { Laborer, AdvancePayment, WorkLog } from '@/lib/types';

export default function DashboardPage() {
  const [laborerCount, setLaborerCount] = useState(0);
  const [advanceCount, setAdvanceCount] = useState(0);
  const [workLogCount, setWorkLogCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedLaborers = localStorage.getItem(LABORERS_STORAGE_KEY);
      setLaborerCount(storedLaborers ? (JSON.parse(storedLaborers) as Laborer[]).length : initialLaborers.length);

      const storedAdvances = localStorage.getItem(ADVANCES_STORAGE_KEY);
      setAdvanceCount(storedAdvances ? (JSON.parse(storedAdvances) as AdvancePayment[]).length : initialAdvancePayments.length);
      
      const storedWorkLogs = localStorage.getItem(WORK_LOGS_STORAGE_KEY);
      setWorkLogCount(storedWorkLogs ? (JSON.parse(storedWorkLogs) as WorkLog[]).length : initialWorkLogs.length);

    } catch (error) {
      console.error("Error loading dashboard data from localStorage:", error);
      // Fallback to initial data counts in case of error
      setLaborerCount(initialLaborers.length);
      setAdvanceCount(initialAdvancePayments.length);
      setWorkLogCount(initialWorkLogs.length);
    }
    setIsLoading(false);
  }, []);


  const summaryCards = [
    { title: "Total Laborers", value: laborerCount, icon: Users, href: "/laborers", color: "text-primary" },
    { title: "Total Advances", value: advanceCount, icon: IndianRupee, href: "/advances", color: "text-accent" },
    { title: "Work Logs Entries", value: workLogCount, icon: ClipboardList, href: "/work-logs", color: "text-secondary-foreground" },
  ];

  const quickLinks = [
    { title: "Add New Laborer", href: "/laborers#add", icon: PlusCircle },
    { title: "Record Advance", href: "/advances#add", icon: PlusCircle },
    { title: "Daily Labor Entries", href: "/daily-entry#add", icon: ClipboardCheck }, 
    { title: "Generate Report", href: "/reports", icon: ArrowRight },
  ];

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

    </div>
  );
}
