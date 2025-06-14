import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { Users, UserPlus, ClipboardCheck, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  // Mock data - replace with actual data fetching
  const totalLaborers = 78;
  const totalSupervisors = 5;
  const attendanceToday = "92% Present";
  const lastAttendanceDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Laborers" 
          value={totalLaborers} 
          icon={UserPlus} 
          description="Currently active laborers"
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        />
        <MetricCard 
          title="Total Supervisors" 
          value={totalSupervisors} 
          icon={Users} 
          description="Registered supervisors"
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        />
        <MetricCard 
          title="Today's Attendance" 
          value={attendanceToday} 
          icon={ClipboardCheck} 
          description="Based on latest entries"
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        />
        <MetricCard 
          title="Last Attendance Marked" 
          value={lastAttendanceDate} 
          icon={CalendarDays} 
          description="Date of last records"
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <AttendanceSummary />
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline">Recent Activities</CardTitle>
          <CardDescription>Overview of recent system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="text-sm text-muted-foreground">New laborer "Rajesh Kumar" added.</li>
            <li className="text-sm text-muted-foreground">Attendance for 2024-07-25 marked by Supervisor "Amit Singh".</li>
            <li className="text-sm text-muted-foreground">New supervisor "Priya Sharma" account created.</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
