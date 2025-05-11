
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BottomToolbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/daily-entry#add", label: "Add Log", icon: PlusCircle, isCentral: true },
    { href: "/laborers", label: "Laborers", icon: Users },
  ];

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
                pathname === item.href && !item.isCentral && "text-primary bg-primary/10",
                pathname === "/daily-entry" && item.href === "/daily-entry#add" && "text-primary bg-primary/10" 
              )}
              aria-current={pathname === item.href ? "page" : undefined}
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
