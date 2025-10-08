"use client";

import type React from "react";

import Link from "next/link";
import {
  Calculator,
  ClipboardList,
  Brain,
  Calendar,
  Users,
  BookOpen,
  BarChart,
  ChevronRight,
  Globe,
  Replace,
  Wand2,
  Timer,
  Star,
  Search,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  link: string;
  category: "productivity" | "academic" | "resources";
}

export default function Home() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("schoolPlayground_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem(
      "schoolPlayground_favorites",
      JSON.stringify(newFavorites)
    );
  };

  const tools: Tool[] = [
    {
      id: "grade-tool",
      title: "Grade Tool",
      description: "Advanced grade analysis and calculation toolkit",
      icon: Target,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/grade-tool",
      category: "academic",
    },
    {
      id: "grade-calculator",
      title: "Grade Calculator",
      description: "Calculate your grades and see what you need to pass",
      icon: Calculator,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/grade-calculator",
      category: "academic",
    },
    {
      id: "eszett-converter",
      title: "Eszett Converter",
      description:
        "Easily detect and convert German 'ß' characters to 'ss' for text transformations.",
      icon: Replace,
      color: "bg-blue-200 dark:bg-blue-900/40",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-950 dark:text-white",
      link: "/eszett-converter",
      category: "productivity",
    },
    {
      id: "focus-timer",
      title: "Focus Timer",
      description:
        "Stay focused and manage your time effectively with this Pomodoro timer.",
      icon: Timer,
      color: "bg-blue-200 dark:bg-blue-900/40",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-950 dark:text-white",
      link: "/focus-timer",
      category: "productivity",
    },
    // {
    //   id: "grammar-checker",
    //   title: "Grammar Checker",
    //   description:
    //     "Check your writing for grammar, spelling, punctuation, and style issues",
    //   icon: Wand2,
    //   color: "bg-blue-200 dark:bg-blue-900/40",
    //   iconBg: "bg-blue-500",
    //   iconColor: "text-white",
    //   textColor: "text-blue-950 dark:text-white",
    //   link: "/grammar-checker",
    //   category: "productivity",
    // },
    {
      id: "homework-planner",
      title: "Homework Planner",
      description: "Keep track of assignments and deadlines",
      icon: ClipboardList,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/homework",
      category: "academic",
    },
    {
      id: "exam-prep",
      title: "Exam Preparation",
      description: "Flashcards, practice tests, and learning tips",
      icon: Brain,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/exam-prep",
      category: "academic",
    },
    {
      id: "timetable",
      title: "Timetable Organizer",
      description: "Plan your school schedule efficiently",
      icon: Calendar,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/timetable",
      category: "academic",
    },
    {
      id: "community",
      title: "Community & Tips",
      description: "Get advice and share helpful insights",
      icon: Users,
      color: "bg-orange-200 dark:bg-orange-900/40",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      textColor: "text-orange-950 dark:text-white",
      link: "/community",
      category: "resources",
    },
    {
      id: "guides",
      title: "Subject Guides",
      description: "Comprehensive guides for all subjects",
      icon: BookOpen,
      color: "bg-orange-200 dark:bg-orange-900/40",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      textColor: "text-orange-950 dark:text-white",
      link: "/guides",
      category: "resources",
    },
    {
      id: "progress",
      title: "Progress Tracker",
      description: "Monitor your academic improvement",
      icon: BarChart,
      color: "bg-purple-200 dark:bg-purple-900/40",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      textColor: "text-purple-950 dark:text-white",
      link: "/progress",
      category: "academic",
    },
    {
      id: "sites",
      title: "Sites",
      description: "Access educational websites and online resources",
      icon: Globe,
      color: "bg-orange-200 dark:bg-orange-900/40",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      textColor: "text-orange-950 dark:text-white",
      link: "/sites",
      category: "resources",
    },
  ];

  // Filter tools based on search query
  const filteredTools = tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get favorite tools
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));

  // Quick actions (most popular tools)
  const quickActions = [
    {
      title: "Calculate Grade",
      description: "Quick grade calculation",
      icon: Calculator,
      link: "/grade-calculator",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Start Focus Timer",
      description: "Begin a study session",
      icon: Timer,
      link: "/focus-timer",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Add Homework",
      description: "Track new assignment",
      icon: ClipboardList,
      link: "/homework",
      gradient: "from-blue-500 to-cyan-500",
    },
  ];

  // Categorize tools
  const productivityTools = filteredTools.filter(
    (tool) => tool.category === "productivity"
  );
  const academicTools = filteredTools.filter(
    (tool) => tool.category === "academic"
  );
  const resourceTools = filteredTools.filter(
    (tool) => tool.category === "resources"
  );

  const ToolCard = ({ tool }: { tool: Tool }) => {
    const isFavorite = favorites.includes(tool.id);

    return (
      <div className="relative group h-full">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(tool.id);
          }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border cursor-pointer hover:bg-background transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isFavorite
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground"
            )}
          />
        </button>

        <Link
          href={tool.link}
          className="block h-full transition-all duration-200 focus:outline-none rounded-lg"
        >
          <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-2 border-border/60 dark:border-border/80 hover:border-primary/50 dark:hover:border-primary/60">
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
                <div className="p-4 flex-1 flex flex-col justify-between bg-card border-t border-border/40">
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
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to SchoolPlayground
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personalized educational toolkit for academic success
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quick Actions */}
      {!searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.link}
                href={action.link}
                className="block transition-all duration-200 hover:scale-[1.02]"
              >
                <Card className="border-2 border-border/60 dark:border-border/80 hover:border-primary/50 dark:hover:border-primary/60 transition-all duration-200 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-xl p-3 bg-gradient-to-br ${action.gradient} text-white`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {!searchQuery && favoriteTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-semibold">Your Favorites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Productivity Tools */}
      {productivityTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Productivity Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productivityTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Academic Tools */}
      {academicTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Academic Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {academicTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {resourceTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Resources</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resourceTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
}
