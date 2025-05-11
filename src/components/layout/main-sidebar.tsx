"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  IndianRupee, // Corrected from DollarSign based on previous changes
  ClipboardList,
  FileText,
  LayoutDashboard,
  Building,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar";
import { SheetTitle } from "@/components/ui/sheet"; // Import SheetTitle for mobile accessibility

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/laborers", label: "Laborers", icon: Users },
  { href: "/advances", label: "Advances", icon: IndianRupee },
  { href: "/work-logs", label: "Work Logs", icon: ClipboardList },
  { href: "/daily-entry", label: "Daily Entry", icon: ClipboardCheck },
  {
    label: "Reports",
    icon: FileText,
    subItems: [
      { href: "/reports/attendance", label: "Attendance Report", icon: ClipboardList },
      { href: "/reports/advances-summary", label: "Advance Summary", icon: IndianRupee },
    ],
  },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar(); // Use the hook to detect mobile context

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        {/* Add a visually hidden SheetTitle for accessibility when in mobile sheet view */}
        {isMobile && (
          <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
        )}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <Building className="h-7 w-7 text-sidebar-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Jrk Labor Mgmt</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
            item.subItems ? (
              <SidebarGroup key={item.label}>
                <SidebarGroupLabel className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarGroupLabel>
                {item.subItems.map((subItem) => (
                  <SidebarMenuItem key={subItem.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === subItem.href}
                      tooltip={{ children: subItem.label, side: 'right', align: 'center' }}
                      className="justify-start"
                    >
                      <Link href={subItem.href} className="flex items-center gap-3">
                        <subItem.icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
            ) : (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className="justify-start"
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
        <div className="group-data-[collapsible=icon]:hidden">
          <span className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} Jrk Inc.</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}