

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  IndianRupee,
  ClipboardList,
  // FileText, // Removed as Reports section is being removed
  LayoutDashboard,
  Building,
  ClipboardCheck,
  LogOut, // Added LogOut icon
  UserPlus, // Added UserPlus for registration link
  FileArchive, // Icon for Proprietor Documents
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarGroup, // Removed as Reports section is being removed
  // SidebarGroupLabel, // Removed as Reports section is being removed
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context"; // Import useAuth
// import { Button } from "../ui/button"; // Button import not used directly here, SidebarMenuButton is used for logout
import { useToast } from "@/hooks/use-toast"; // Import useToast

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/labours", label: "Labours", icon: Users },
  { href: "/advances", label: "Advances", icon: IndianRupee },
  { href: "/work-logs", label: "Work Logs", icon: ClipboardList },
  { href: "/daily-entry", label: "Daily Entry", icon: ClipboardCheck },
  { href: "/proprietor-documents", label: "Proprietor Docs", icon: FileArchive },
  // { // Reports section removed
  //   label: "Reports",
  //   icon: FileText,
  //   subItems: [
  //     { href: "/reports/attendance", label: "Attendance Report", icon: ClipboardList },
  //     { href: "/reports/advances-summary", label: "Advance Summary", icon: IndianRupee },
  //   ],
  // },
];

// Add supervisor registration link specifically for Admin
const adminNavItems = [
    { href: "/register-supervisor", label: "Register Supervisor", icon: UserPlus },
];


export function MainSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { isAuthenticated, logout, isLoading, currentUsername } = useAuth(); // Get auth state, logout function, and username
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  // Don't render the sidebar if loading or not authenticated
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
          <Building className="h-7 w-7 text-sidebar-primary" />
          <span className="group-data-[collapsible=icon]:hidden">JRK ENTERPRISES</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
            // SubItems logic removed as Reports section is removed
            // item.subItems ? (
            //   <SidebarGroup key={item.label}>
            //     <SidebarGroupLabel className="flex items-center gap-2">
            //       <item.icon className="h-5 w-5" />
            //       <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            //     </SidebarGroupLabel>
            //     {item.subItems.map((subItem) => (
            //       <SidebarMenuItem key={subItem.href}>
            //         <SidebarMenuButton
            //           asChild
            //           isActive={pathname === subItem.href}
            //           tooltip={{ children: subItem.label, side: 'right', align: 'center' }}
            //           className="justify-start"
            //         >
            //           <Link href={subItem.href} className="flex items-center gap-3">
            //             <subItem.icon className="h-4 w-4" />
            //             <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
            //           </Link>
            //         </SidebarMenuButton>
            //       </SidebarMenuItem>
            //     ))}
            //   </SidebarGroup>
            // ) : (
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
            // )
          )}
           {/* Conditionally render admin-specific links */}
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
      <SidebarFooter className="p-2 flex flex-col gap-2 items-stretch mt-auto"> {/* Added mt-auto */}
         {/* Logout Button */}
         <SidebarMenuButton
            onClick={handleLogout}
            tooltip={{ children: "Logout", side: 'right', align: 'center' }}
            className="justify-start w-full"
            variant="ghost" // Optional: style as ghost button
         >
           <LogOut className="h-5 w-5" />
           <span className="group-data-[collapsible=icon]:hidden">Logout</span>
         </SidebarMenuButton>

        {/* Copyright Info */}
        <div className="group-data-[collapsible=icon]:hidden text-center">
          <span className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} Jrk Enterprises.</span>
        </div>
         <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
           {/* Optional: Icon-only copyright or element when collapsed */}
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}

