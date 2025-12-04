"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { User, Lock, SettingsIcon, GraduationCap, Database } from "lucide-react"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { PreferencesSettings } from "@/components/settings/preferences-settings"
import { AcademicSettings } from "@/components/settings/academic-settings"
import { DataSettings } from "@/components/settings/data-settings"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <>
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-4">
        <Card className="p-6 border-0 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto bg-transparent p-0 gap-1 mb-6">
              <TabsTrigger
                value="profile"
                className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Academic</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <PreferencesSettings />
            </TabsContent>

            <TabsContent value="academic" className="mt-0">
              <AcademicSettings />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <DataSettings />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  )
}
