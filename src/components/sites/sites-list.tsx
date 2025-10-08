"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, Globe } from "lucide-react"
import Image from "next/image"

interface Site {
  id: string
  name: string
  description: string
  url: string
  category: "study" | "notes" | "language" | "research" | "productivity" | "writing"
  logo: string
}

const sites: Site[] = [
  // Study Tools
  {
    id: "quizlet",
    name: "Quizlet",
    description: "Create flashcards and study sets for any subject",
    url: "https://quizlet.com",
    category: "study",
    logo: "https://logo.clearbit.com/quizlet.com",
  },
  {
    id: "anki",
    name: "Anki",
    description: "Powerful spaced repetition flashcard app",
    url: "https://apps.ankiweb.net",
    category: "study",
    logo: "https://logo.clearbit.com/ankiweb.net",
  },
  {
    id: "kahoot",
    name: "Kahoot!",
    description: "Game-based learning platform with quizzes",
    url: "https://kahoot.com",
    category: "study",
    logo: "https://logo.clearbit.com/kahoot.com",
  },
  {
    id: "studyblue",
    name: "StudyBlue",
    description: "Digital flashcards and study guides",
    url: "https://www.studyblue.com",
    category: "study",
    logo: "https://logo.clearbit.com/studyblue.com",
  },

  // Note-Taking
  {
    id: "notion",
    name: "Notion",
    description: "All-in-one workspace for notes, docs, and projects",
    url: "https://notion.so",
    category: "notes",
    logo: "https://logo.clearbit.com/notion.so",
  },
  {
    id: "evernote",
    name: "Evernote",
    description: "Note-taking and organization app",
    url: "https://evernote.com",
    category: "notes",
    logo: "https://logo.clearbit.com/evernote.com",
  },
  {
    id: "onenote",
    name: "OneNote",
    description: "Microsoft's digital notebook",
    url: "https://www.onenote.com",
    category: "notes",
    logo: "https://logo.clearbit.com/onenote.com",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Powerful knowledge base with markdown support",
    url: "https://obsidian.md",
    category: "notes",
    logo: "https://logo.clearbit.com/obsidian.md",
  },

  // Language Learning
  {
    id: "duolingo",
    name: "Duolingo",
    description: "Learn languages for free with fun lessons",
    url: "https://duolingo.com",
    category: "language",
    logo: "https://logo.clearbit.com/duolingo.com",
  },
  {
    id: "babbel",
    name: "Babbel",
    description: "Learn a new language with expert-designed courses",
    url: "https://babbel.com",
    category: "language",
    logo: "https://logo.clearbit.com/babbel.com",
  },
  {
    id: "memrise",
    name: "Memrise",
    description: "Learn languages with native speakers",
    url: "https://memrise.com",
    category: "language",
    logo: "https://logo.clearbit.com/memrise.com",
  },
  {
    id: "busuu",
    name: "Busuu",
    description: "Language learning with personalized study plans",
    url: "https://busuu.com",
    category: "language",
    logo: "https://logo.clearbit.com/busuu.com",
  },

  // Research & Learning
  {
    id: "khan-academy",
    name: "Khan Academy",
    description: "Free online courses and practice",
    url: "https://khanacademy.org",
    category: "research",
    logo: "https://logo.clearbit.com/khanacademy.org",
  },
  {
    id: "coursera",
    name: "Coursera",
    description: "Online courses from top universities",
    url: "https://coursera.org",
    category: "research",
    logo: "https://logo.clearbit.com/coursera.org",
  },
  {
    id: "google-scholar",
    name: "Google Scholar",
    description: "Search for scholarly literature and research",
    url: "https://scholar.google.com",
    category: "research",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    id: "wolfram-alpha",
    name: "Wolfram Alpha",
    description: "Computational knowledge engine",
    url: "https://wolframalpha.com",
    category: "research",
    logo: "https://logo.clearbit.com/wolframalpha.com",
  },

  // Productivity
  {
    id: "todoist",
    name: "Todoist",
    description: "Task manager and to-do list app",
    url: "https://todoist.com",
    category: "productivity",
    logo: "https://logo.clearbit.com/todoist.com",
  },
  {
    id: "trello",
    name: "Trello",
    description: "Visual project management with boards",
    url: "https://trello.com",
    category: "productivity",
    logo: "https://logo.clearbit.com/trello.com",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Stay focused and build healthy habits",
    url: "https://forestapp.cc",
    category: "productivity",
    logo: "https://logo.clearbit.com/forestapp.cc",
  },
  {
    id: "pomofocus",
    name: "Pomofocus",
    description: "Customizable pomodoro timer",
    url: "https://pomofocus.io",
    category: "productivity",
    logo: "https://logo.clearbit.com/pomofocus.io",
  },

  // Writing
  {
    id: "grammarly",
    name: "Grammarly",
    description: "Writing assistant for grammar and clarity",
    url: "https://grammarly.com",
    category: "writing",
    logo: "https://logo.clearbit.com/grammarly.com",
  },
  {
    id: "hemingway",
    name: "Hemingway Editor",
    description: "Make your writing bold and clear",
    url: "https://hemingwayapp.com",
    category: "writing",
    logo: "https://logo.clearbit.com/hemingwayapp.com",
  },
  {
    id: "google-docs",
    name: "Google Docs",
    description: "Online document editor with collaboration",
    url: "https://docs.google.com",
    category: "writing",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    id: "deepl",
    name: "DeepL",
    description: "AI-powered translation tool",
    url: "https://deepl.com",
    category: "writing",
    logo: "https://logo.clearbit.com/deepl.com",
  },
]

const categoryLabels = {
  study: "Study Tools",
  notes: "Note-Taking",
  language: "Language Learning",
  research: "Research & Learning",
  productivity: "Productivity",
  writing: "Writing",
}

const categoryColors = {
  study: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  notes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  language: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  research: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  productivity: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  writing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
}

export function SitesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || site.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>

  return (
        <div className="grid gap-4">
          <Card className="p-6 border-0 shadow-sm">
            <div className="mb-6">
              <div className="bg-orange-200 dark:bg-orange-900/40 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full p-2 bg-orange-500 text-white self-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-orange-950 dark:text-white">Sites</h2>
                    <p className="text-sm text-orange-900 dark:text-orange-100">
                      Access educational websites and online resources
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {categoryLabels[category]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSites.map((site) => (
                <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer" className="group">
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 relative rounded-full overflow-hidden bg-white dark:bg-white/90 flex items-center justify-center p-1.5">
                        <Image
                          src={site.logo || "/placeholder.svg"}
                          alt={`${site.name} logo`}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full rounded-full"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {site.name}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{site.description}</p>
                        <Badge className={categoryColors[site.category]} variant="secondary">
                          {categoryLabels[site.category]}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            {/* No Results */}
            {filteredSites.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No sites found matching your search.</p>
              </div>
            )}
          </Card>
        </div>
  )
}
