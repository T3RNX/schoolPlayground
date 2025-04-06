"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type HistoryEntry = {
  id: string
  date: Date
  system: string
  grade: number
  details: string
}

export function GradeHistory() {
  // In a real app, you'd fetch this from a database or localStorage
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "1",
      date: new Date(2023, 9, 15),
      system: "Switzerland",
      grade: 5.2,
      details: "Math Quiz: 26/30 points",
    },
    {
      id: "2",
      date: new Date(2023, 9, 10),
      system: "Switzerland",
      grade: 4.8,
      details: "Physics Test: 24/30 points",
    },
    {
      id: "3",
      date: new Date(2023, 9, 5),
      system: "Switzerland",
      grade: 3.5,
      details: "Chemistry Exam: 18/30 points",
    },
  ])

  const clearHistory = () => {
    // In a real app, you'd also clear from storage
    setHistory([])
  }

  const getGradeColor = (grade: number) => {
    return grade >= 4 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
  }

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-blue-500 text-white">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium">Grade History</h3>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No grade calculations yet.</p>
          <p className="text-sm">Your calculation history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{entry.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.date.toLocaleDateString()} • {entry.system}
                  </p>
                </div>
                <p className={`text-xl font-bold ${getGradeColor(entry.grade)}`}>{entry.grade}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

