
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context'; // Import useAuth

export function BottomToolbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/daily-entry#add", label: "Add Log", icon: PlusCircle, isCentral: true },
    { href: "/labours", label: "Labours", icon: Users },
  ];

  // Don't render if loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Don't render on login page
  if (pathname === '/login') {
     return null;
  }


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-2 shadow-top md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link href={item.href} key={item.label} passHref legacyBehavior>
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-auto p-2 rounded-md transition-colors",
                item.isCentral ? "text-primary scale-110 hover:bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                pathname === item.href.split('#')[0] && !item.isCentral && "text-primary bg-primary/10", // Compare base path
                pathname === "/daily-entry" && item.href === "/daily-entry#add" && "text-primary bg-primary/10" // Keep specific highlight for Add Log
                // pathname === "/labours" && item.href === "/labours" && "text-primary bg-primary/10" // Removed as covered by general check
              )}
              aria-current={pathname === item.href.split('#')[0] ? "page" : undefined}
            >
              <item.icon className={cn("h-6 w-6 mb-0.5", item.isCentral && "h-8 w-8")} />
              <span className={cn("text-xs", item.isCentral ? "font-medium" : "font-normal")}>
                {item.label}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
