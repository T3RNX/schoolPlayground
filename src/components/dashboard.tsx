"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tools = [
    {
      title: "Grade Calculator",
      description: "Calculate your grades and see what you need to pass",
      icon: Calculator,
      color: "bg-pink-200 dark:bg-pink-900/40", // Lighter background for light mode
      iconBg: "bg-pink-500", // Bright icon background
      iconColor: "text-white", // Icon color
      textColor: "text-pink-950 dark:text-white", // Text color adjusted for light/dark mode
      link: "/grade-calculator",
    },
    {
      title: "Study Resources",
      description: "Summaries, formulas, and helpful materials",
      icon: Book,
      color: "bg-blue-200 dark:bg-blue-900/40",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-950 dark:text-white",
      link: "/resources",
    },
    {
      title: "Homework Planner",
      description: "Keep track of assignments and deadlines",
      icon: ClipboardList,
      color: "bg-green-200 dark:bg-green-900/40",
      iconBg: "bg-green-500",
      iconColor: "text-white",
      textColor: "text-green-950 dark:text-white",
      link: "/homework",
    },
    {
      title: "Exam Preparation",
      description: "Flashcards, practice tests, and learning tips",
      icon: Brain,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/exam-prep",
    },
    {
      title: "Timetable Organizer",
      description: "Plan your school schedule efficiently",
      icon: Calendar,
      color: "bg-orange-200 dark:bg-orange-900/40",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      textColor: "text-orange-950 dark:text-white",
      link: "/timetable",
    },
    {
      title: "Community & Tips",
      description: "Get advice and share helpful insights",
      icon: Users,
      color: "bg-cyan-200 dark:bg-cyan-900/40",
      iconBg: "bg-cyan-500",
      iconColor: "text-white",
      textColor: "text-cyan-950 dark:text-white",
      link: "/community",
    },
    {
      title: "Subject Guides",
      description: "Comprehensive guides for all subjects",
      icon: BookOpen,
      color: "bg-yellow-200 dark:bg-yellow-900/40",
      iconBg: "bg-yellow-500",
      iconColor: "text-white",
      textColor: "text-yellow-950 dark:text-white",
      link: "/guides",
    },
    {
      title: "Progress Tracker",
      description: "Monitor your academic improvement",
      icon: BarChart,
      color: "bg-red-200 dark:bg-red-900/40",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      textColor: "text-red-950 dark:text-white",
      link: "/progress",
    },
  ]

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
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg">SchoolPlayground</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-2">
          <div className="w-full rounded-md bg-secondary p-2 flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </div>

          {/* Navigation items with proper hover effect */}
          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <Calculator className="h-5 w-5" />
            <span>Grade Calculator</span>
          </div>

          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <Book className="h-5 w-5" />
            <span>Study Resources</span>
          </div>

          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <ClipboardList className="h-5 w-5" />
            <span>Homework Planner</span>
          </div>

          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <Brain className="h-5 w-5" />
            <span>Exam Preparation</span>
          </div>

          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <Calendar className="h-5 w-5" />
            <span>Timetable</span>
          </div>

          <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
            <Users className="h-5 w-5" />
            <span>Community</span>
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">SUPPORT</div>
            <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
              <HelpCircle className="h-5 w-5" />
              <span>Help Center</span>
            </div>

            <div className="w-full rounded-md p-2 flex items-center gap-2 hover:bg-secondary/50 cursor-pointer transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with higher z-index to prevent overlap issues */}
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 shadow-sm">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search tools, resources..." className="w-full pl-8" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="hover:bg-secondary/50 transition-colors">
              <Bell className="h-5 w-5" />
            </Button>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
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

        {/* Dashboard content */}
        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-3">
          <div className="mb-4 px-1">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to SchoolPlayground</h1>
            <p className="text-muted-foreground">Your all-in-one school helper. Choose a tool to get started!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tools.map((tool, index) => (
              <a
                key={index}
                href={tool.link}
                className="block h-full transition-all duration-200 outline-none focus:ring-2 focus:ring-primary rounded-lg"
              >
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-0 dark:border-0 hover:border-0 dark:hover:border-0">
                  <CardContent className="p-0 h-full">
                    <div className="flex flex-col h-full">
                      <div className={`${tool.color} p-4 flex items-center gap-3`}>
                        <div className={`rounded-full p-2 ${tool.iconBg} ${tool.iconColor}`}>
                          <tool.icon className="h-5 w-5" />
                        </div>
                        <h3 className={`font-medium text-base ${tool.textColor}`}>{tool.title}</h3>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between bg-card dark:bg-zinc-800/50">
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                        <div className="flex items-center justify-end mt-4 text-sm font-medium text-foreground">
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

          <div className="mt-4 rounded-lg border-0 bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
            <p className="text-muted-foreground mb-3 text-sm">
              New to SchoolPlayground? Here&#39;s how to make the most of our platform:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <div className="rounded-full bg-primary/10 p-2 mb-2">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium mb-1 text-sm">Calculate Your Grades</h3>
                <p className="text-xs text-muted-foreground">
                  Use our grade calculator to track your academic performance
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <div className="rounded-full bg-primary/10 p-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium mb-1 text-sm">Plan Your Homework</h3>
                <p className="text-xs text-muted-foreground">
                  Stay organized with our homework planner and never miss a deadline
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <div className="rounded-full bg-primary/10 p-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
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
  )
}

