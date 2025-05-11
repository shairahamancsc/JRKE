
// No "use client" needed, this is a Server Component by default

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, ClipboardList, PlusCircle, ArrowRight } from 'lucide-react';
import { initialLaborers, initialAdvancePayments, initialWorkLogs } from '@/lib/data';

export default function DashboardPage() {
  // Data processing is now done on the server during rendering
  const laborerCount = initialLaborers.length;
  const advanceCount = initialAdvancePayments.length;
  const workLogCount = initialWorkLogs.length; // This refers to all work logs from mock data

  const summaryCards = [
    { title: "Total Laborers", value: laborerCount, icon: Users, href: "/laborers", color: "text-primary" },
    { title: "Total Advances", value: advanceCount, icon: DollarSign, href: "/advances", color: "text-accent" },
    { title: "Work Logs Entries", value: workLogCount, icon: ClipboardList, href: "/work-logs", color: "text-secondary-foreground" }, // Clarified label
  ];

  const quickLinks = [
    { title: "Add New Laborer", href: "/laborers#add", icon: PlusCircle },
    { title: "Record Advance", href: "/advances#add", icon: PlusCircle },
    { title: "Log Daily Work", href: "/daily-entry#add", icon: PlusCircle }, // Corrected from work-logs#add to daily-entry#add based on UI
    { title: "Generate Report", href: "/reports", icon: ArrowRight },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>
      
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

