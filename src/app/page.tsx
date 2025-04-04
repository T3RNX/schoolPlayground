import Link from "next/link";
import {
  Calculator,
  Book,
  ClipboardList,
  Brain,
  Calendar,
  Users,
  BookOpen,
  BarChart,
  ChevronRight,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
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
    {
      title: "Sites",
      description: "Access educational websites and online resources",
      icon: Globe,
      color: "bg-indigo-200 dark:bg-indigo-900/40",
      iconBg: "bg-indigo-500",
      iconColor: "text-white",
      textColor: "text-indigo-950 dark:text-white",
      link: "/sites",
    },
  ];

  return (
    <>
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to SchoolPlayground
        </h1>
        <p className="text-muted-foreground">
          Your all-in-one school helper. Choose a tool to get started!
        </p>
      </div>

      <div className="mb-4 rounded-lg border-0 bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <p className="text-muted-foreground mb-3 text-sm">
          New to SchoolPlayground? Here&#39;s how to make the most of our
          platform:
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={tool.link}
            className="block h-full transition-all duration-200 focus:outline-none rounded-lg"
          >
            <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-0 dark:border-0 hover:border-0 dark:hover:border-0">
              <CardContent className="p-0 h-full">
                <div className="flex flex-col h-full">
                  <div className={`${tool.color} p-4 flex items-center gap-3`}>
                    <div
                      className={`rounded-full p-2 ${tool.iconBg} ${tool.iconColor}`}
                    >
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <h3 className={`font-medium text-base ${tool.textColor}`}>
                      {tool.title}
                    </h3>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between bg-card dark:bg-zinc-800/50">
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-end mt-4 text-sm font-medium text-foreground">
                      <span>Open Tool</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
