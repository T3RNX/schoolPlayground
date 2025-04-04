"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Calculator,
  Book,
  ClipboardList,
  Brain,
  Calendar,
  Users,
  Search,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Home,
  HelpCircle,
  GraduationCap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavItem } from "@/components/nav-item";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Memoize the closeSidebar function to prevent recreating it on each render
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Close sidebar when clicking outside on mobile or when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeSidebar();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeSidebar]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar - completely separate from the main layout */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop with fade animation */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              closeSidebar();
            }
          }}
        />

        {/* Sidebar content with slide animation */}
        <div
          className={`relative w-64 max-w-[80%] bg-card h-full shadow-lg transform transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 bg-card">
            <div className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg">SchoolPlayground</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="text-foreground hover:bg-secondary/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1 p-2">
            <NavItem
              href="/"
              icon={Home}
              label="Dashboard"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/grade-calculator"
              icon={Calculator}
              label="Grade Calculator"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/resources"
              icon={Book}
              label="Study Resources"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/homework"
              icon={ClipboardList}
              label="Homework Planner"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/exam-prep"
              icon={Brain}
              label="Exam Preparation"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/timetable"
              icon={Calendar}
              label="Timetable"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/community"
              icon={Users}
              label="Community"
              onNavigate={closeSidebar}
            />
            <NavItem
              href="/sites"
              icon={Globe}
              label="Sites"
              onNavigate={closeSidebar}
            />

            <div className="pt-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-2">
                SUPPORT
              </div>
              <NavItem
                href="/help"
                icon={HelpCircle}
                label="Help Center"
                onNavigate={closeSidebar}
              />
              <NavItem
                href="/settings"
                icon={Settings}
                label="Settings"
                onNavigate={closeSidebar}
              />
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg">SchoolPlayground</span>
          </div>
        </div>
        <nav className="space-y-1 p-2">
          <NavItem href="/" icon={Home} label="Dashboard" />
          <NavItem
            href="/grade-calculator"
            icon={Calculator}
            label="Grade Calculator"
          />
          <NavItem href="/resources" icon={Book} label="Study Resources" />
          <NavItem
            href="/homework"
            icon={ClipboardList}
            label="Homework Planner"
          />
          <NavItem href="/exam-prep" icon={Brain} label="Exam Preparation" />
          <NavItem href="/timetable" icon={Calendar} label="Timetable" />
          <NavItem href="/community" icon={Users} label="Community" />
          <NavItem href="/sites" icon={Globe} label="Sites" />

          <div className="pt-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">
              SUPPORT
            </div>
            <NavItem href="/help" icon={HelpCircle} label="Help Center" />
            <NavItem href="/settings" icon={Settings} label="Settings" />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with higher z-index to prevent overlap issues */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-transform hover:scale-105 active:scale-95"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools, resources..."
              className="w-full pl-8"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/50 transition-all hover:scale-105 active:scale-95"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-secondary/50 transition-all hover:scale-105 active:scale-95"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="Student"
                    />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-0 shadow-lg">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
