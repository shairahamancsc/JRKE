
"use client";

import Link from "next/link";
import Image from 'next/image'; // Import next/image
import { usePathname } from "next/navigation";
import {
  Users,
  IndianRupee,
  ClipboardList,
  LayoutDashboard,
  // Building, // No longer needed here
  ClipboardCheck,
  LogOut,
  UserPlus,
  FileArchive,
  Calculator,
  Wallet,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/labours", label: "Labours", icon: Users },
  { href: "/advances", label: "Advances", icon: IndianRupee },
  { href: "/work-logs", label: "Work Logs", icon: ClipboardList },
  { href: "/daily-entry", label: "Daily Entry", icon: ClipboardCheck },
  { href: "/payment", label: "Payment", icon: Wallet },
  { href: "/proprietor-documents", label: "Proprietor Docs", icon: FileArchive },
  { href: "/gst-calculator", label: "GST Calculator", icon: Calculator },
  { href: "/self-declaration-form", label: "Self Declaration", icon: Printer },
];

const adminNavItems = [
    { href: "/register-supervisor", label: "Register Supervisor", icon: UserPlus },
];


export function MainSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { isAuthenticated, logout, isLoading, currentUsername } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const isAdmin = currentUsername === 'Admin';


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        {isMobile && (
          <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
        )}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <div className="relative h-7 w-auto text-sidebar-primary"> {/* Removed fixed aspect ratio */}
            <Image
              src="/jrk-logo.png"
              alt="JRK Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">JRK ENTERPRISES</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
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
          )}
           {isAdmin && adminNavItems.map((item) => (
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
           ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 flex flex-col gap-2 items-stretch mt-auto">
         <SidebarMenuButton
            onClick={handleLogout}
            tooltip={{ children: "Logout", side: 'right', align: 'center' }}
            className="justify-start w-full"
            variant="ghost"
         >
           <LogOut className="h-5 w-5" />
           <span className="group-data-[collapsible=icon]:hidden">Logout</span>
         </SidebarMenuButton>

        <div className="group-data-[collapsible=icon]:hidden text-center">
          <span className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} Jrk Enterprises.</span>
        </div>
         <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
