
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, IndianRupee, ArrowRight, ClipboardList } from 'lucide-react';

export default function ReportsPage() {
  const reportTypes = [
    {
      title: "Daily Attendance Report",
      description: "Generate an AI-powered daily attendance report based on work logs and timestamped pictures.",
      href: "/reports/attendance",
      icon: ClipboardList,
    },
    {
      title: "Advance Payments Summary",
      description: "Query and get an AI-generated summary of total advances paid to labour.",
      href: "/reports/advances-summary",
      icon: IndianRupee, // Changed from DollarSign
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Automated Reporting</h1>
        <p className="text-muted-foreground mt-2">
          Leverage AI to generate insightful reports for your labour management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <report.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">{report.title}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={report.href} passHref>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Generate Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
