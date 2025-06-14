"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import { LayoutDashboard, Users, UserPlus, ClipboardList, LogOut, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Supervisors", href: "/admin/supervisors", icon: Users },
  { title: "Laborers", href: "/admin/laborers", icon: UserPlus },
  { title: "Attendance", href: "/admin/attendance", icon: ClipboardList },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("jrkeAuthToken");
    }
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/admin/login");
  };

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform sm:translate-x-0 flex flex-col shadow-lg", className)}>
      <div className="flex items-center justify-center h-20 border-b border-sidebar-border">
        <Building className="h-8 w-8 mr-2 text-sidebar-primary" />
        <h1 className="text-2xl font-bold font-headline text-sidebar-primary-foreground">Jrke Admin</h1>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="py-4 px-2">
          {navItems.map((item) => (
            <Link key={item.title} href={item.href} legacyBehavior passHref>
              <a
                className={cn(
                  "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === item.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </a>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
