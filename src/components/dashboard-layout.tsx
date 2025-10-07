"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Calculator,
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
  Replace,
  LogIn,
  UserPlus,
  TrendingUp,
  History,
} from "lucide-react"
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
import { NavItem } from "@/components/nav-item"
import { createBrowserClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeSidebar()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [closeSidebar])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          aria-label="Close sidebar"
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 border-0 appearance-none outline-none ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
        />

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
            <NavItem href="/" icon={Home} label="Dashboard" onNavigate={closeSidebar} />
            <NavItem href="/grade-calculator" icon={Calculator} label="Grade Calculator" onNavigate={closeSidebar} />
            <NavItem href="/grade-tool" icon={TrendingUp} label="Grade Tool" onNavigate={closeSidebar} />
            <NavItem href="/grade-history" icon={History} label="Grade History" onNavigate={closeSidebar} />
            <NavItem href="/eszett-converter" icon={Replace} label="Eszett Converter" onNavigate={closeSidebar} />
            <NavItem href="/homework" icon={ClipboardList} label="Homework Planner" onNavigate={closeSidebar} />
            <NavItem href="/exam-prep" icon={Brain} label="Exam Preparation" onNavigate={closeSidebar} />
            <NavItem href="/timetable" icon={Calendar} label="Timetable" onNavigate={closeSidebar} />
            <NavItem href="/community" icon={Users} label="Community" onNavigate={closeSidebar} />
            <NavItem href="/sites" icon={Globe} label="Sites" onNavigate={closeSidebar} />

            <div className="pt-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-2">SUPPORT</div>
              <NavItem href="/help" icon={HelpCircle} label="Help Center" onNavigate={closeSidebar} />
              <NavItem href="/settings" icon={Settings} label="Settings" onNavigate={closeSidebar} />
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r bg-card sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg">SchoolPlayground</span>
          </div>
        </div>
        <nav className="space-y-1 p-2">
          <NavItem href="/" icon={Home} label="Dashboard" />
          <NavItem href="/grade-calculator" icon={Calculator} label="Grade Calculator" />
          <NavItem href="/grade-tool" icon={TrendingUp} label="Grade Tool" />
          <NavItem href="/grade-history" icon={History} label="Grade History" />
          <NavItem href="/eszett-converter" icon={Replace} label="Eszett Converter" />
          <NavItem href="/homework" icon={ClipboardList} label="Homework Planner" />
          <NavItem href="/exam-prep" icon={Brain} label="Exam Preparation" />
          <NavItem href="/timetable" icon={Calendar} label="Timetable" />
          <NavItem href="/community" icon={Users} label="Community" />
          <NavItem href="/sites" icon={Globe} label="Sites" />

          <div className="pt-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">SUPPORT</div>
            <NavItem href="/help" icon={HelpCircle} label="Help Center" />
            <NavItem href="/settings" icon={Settings} label="Settings" />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
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
            <Input type="search" placeholder="Search tools, resources..." className="w-full pl-8" />
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

            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-secondary/50 transition-all hover:scale-105 active:scale-95"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-0 shadow-lg">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">My Account</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/auth/login")} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
                <Button size="sm" onClick={() => router.push("/auth/sign-up")} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4">{children}</main>
      </div>
    </div>
  )
}
