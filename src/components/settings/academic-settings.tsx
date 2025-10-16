"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { GraduationCap, Calculator, LogIn } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AcademicSettings() {
  const { user } = useProfile()
  const [defaultGradingSystem, setDefaultGradingSystem] = useState("switzerland")
  const [roundGrades, setRoundGrades] = useState(true)
  const [showPluspoints, setShowPluspoints] = useState(true)
  const [roundingMethod, setRoundingMethod] = useState("half-up")
  const [decimalPlaces, setDecimalPlaces] = useState("2")

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please log in to access academic settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            You need to be logged in to view and manage your academic settings.
          </p>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Grading System
          </CardTitle>
          <CardDescription>Configure your default grading preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="grading-system">Default Grading System</Label>
            <Select value={defaultGradingSystem} onValueChange={setDefaultGradingSystem}>
              <SelectTrigger id="grading-system">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="switzerland">Switzerland (1-6)</SelectItem>
                <SelectItem value="us">United States (A-F)</SelectItem>
                <SelectItem value="uk">United Kingdom (A*-U)</SelectItem>
                <SelectItem value="germany">Germany (1-6)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">This will be used as the default for new subjects</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="round-grades">Round Grades</Label>
              <p className="text-sm text-muted-foreground">Automatically round grade averages</p>
            </div>
            <Switch id="round-grades" checked={roundGrades} onCheckedChange={setRoundGrades} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-pluspoints">Show Pluspoints</Label>
              <p className="text-sm text-muted-foreground">Display pluspoints in grade calculations</p>
            </div>
            <Switch id="show-pluspoints" checked={showPluspoints} onCheckedChange={setShowPluspoints} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculation Preferences
          </CardTitle>
          <CardDescription>Customize how grades are calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="rounding-method">Rounding Method</Label>
            <Select defaultValue="half-up" value={roundingMethod} onValueChange={setRoundingMethod}>
              <SelectTrigger id="rounding-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="half-up">Half Up (Standard)</SelectItem>
                <SelectItem value="half-down">Half Down</SelectItem>
                <SelectItem value="ceiling">Always Round Up</SelectItem>
                <SelectItem value="floor">Always Round Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="decimal-places">Decimal Places</Label>
            <Select defaultValue="2" value={decimalPlaces} onValueChange={setDecimalPlaces}>
              <SelectTrigger id="decimal-places">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Whole numbers)</SelectItem>
                <SelectItem value="1">1 decimal place</SelectItem>
                <SelectItem value="2">2 decimal places</SelectItem>
                <SelectItem value="3">3 decimal places</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
