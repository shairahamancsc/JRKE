
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { ThemeProvider } from "@/components/layout/theme-provider";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Jrk Labor Management',
  description: 'Manage labor, track advances, and log daily work.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <MainSidebar />
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                 <SidebarTrigger variant="outline" size="icon" />
                {/* The SidebarTrigger component already includes PanelLeft and sr-only text.
                    Passing variant and size directly is preferred over asChild here to avoid issues
                    with React.Children.only if the internal structure changes.
                    The default sr-only text in SidebarTrigger is "Toggle Sidebar".
                */}
              </header>
              <main className="flex-1 p-4 sm:p-6 animate-slide-in-up min-w-0">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

