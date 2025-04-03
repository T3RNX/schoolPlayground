"use client";

import { useState } from "react";
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
  BookOpen,
  GraduationCap,
  BarChart,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tools = [
    {
      title: "Grade Calculator",
      description: "Calculate your grades and see what you need to pass",
      icon: Calculator,
      color: "bg-pink-500",
      link: "/grade-calculator",
    },
    {
      title: "Study Resources",
      description: "Summaries, formulas, and helpful materials",
      icon: Book,
      color: "bg-blue-500",
      link: "/resources",
    },
    {
      title: "Homework Planner",
      description: "Keep track of assignments and deadlines",
      icon: ClipboardList,
      color: "bg-green-500",
      link: "/homework",
    },
    {
      title: "Exam Preparation",
      description: "Flashcards, practice tests, and learning tips",
      icon: Brain,
      color: "bg-purple-500",
      link: "/exam-prep",
    },
    {
      title: "Timetable Organizer",
      description: "Plan your school schedule efficiently",
      icon: Calendar,
      color: "bg-orange-500",
      link: "/timetable",
    },
    {
      title: "Community & Tips",
      description: "Get advice and share helpful insights",
      icon: Users,
      color: "bg-cyan-500",
      link: "/community",
    },
    {
      title: "Subject Guides",
      description: "Comprehensive guides for all subjects",
      icon: BookOpen,
      color: "bg-yellow-500",
      link: "/guides",
    },
    {
      title: "Progress Tracker",
      description: "Monitor your academic improvement",
      icon: BarChart,
      color: "bg-red-500",
      link: "/progress",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-zinc-900 dark:text-white" />
            <span className="text-lg">SchoolPlayground</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-2">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calculator className="h-5 w-5" />
            <span>Grade Calculator</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Book className="h-5 w-5" />
            <span>Study Resources</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ClipboardList className="h-5 w-5" />
            <span>Homework Planner</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Brain className="h-5 w-5" />
            <span>Exam Preparation</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calendar className="h-5 w-5" />
            <span>Timetable</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-5 w-5" />
            <span>Community</span>
          </Button>
          <div className="pt-2">
            <div className="text-xs font-semibold text-muted-foreground px-4 py-2">
              SUPPORT
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help Center</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
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
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="Student"
                    />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-3">
          <div className="mb-4 px-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to SchoolPlayground
            </h1>
            <p className="text-muted-foreground">
              Your all-in-one school helper. Choose a tool to get started!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tools.map((tool, index) => (
              <a
                key={index}
                href={tool.link}
                className="block h-full transition-all duration-200 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-lg"
              >
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
                  <CardContent className="p-0 h-full">
                    <div className="flex flex-col h-full">
                      <div
                        className={`${tool.color} bg-opacity-10 dark:bg-opacity-20 p-4 flex items-center gap-3`}
                      >
                        <div
                          className={`rounded-full p-2 ${tool.color} text-white`}
                        >
                          <tool.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-base">{tool.title}</h3>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                        <div className="flex items-center justify-end mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          <span>Open Tool</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card p-4">
            <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
            <p className="text-muted-foreground mb-3 text-sm">
              New to SchoolPlayground? Here's how to make the most of our
              platform:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50">
                <div className="rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 p-2 mb-2">
                  <Calculator className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="font-medium mb-1 text-sm">
                  Calculate Your Grades
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use our grade calculator to track your academic performance
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50">
                <div className="rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 p-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="font-medium mb-1 text-sm">Plan Your Homework</h3>
                <p className="text-xs text-muted-foreground">
                  Stay organized with our homework planner and never miss a
                  deadline
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50">
                <div className="rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 p-2 mb-2">
                  <Users className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="font-medium mb-1 text-sm">Join the Community</h3>
                <p className="text-xs text-muted-foreground">
                  Connect with other students and share helpful study tips
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
