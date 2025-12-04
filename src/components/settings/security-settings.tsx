"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Shield, LogIn } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useProfile } from "@/hooks/use-profile"
import Link from "next/link"

export function SecuritySettings() {
  const { user } = useProfile()
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const supabase = createBrowserClient()

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success("Password updated successfully")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail?.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setEmailLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error

      toast.success("Confirmation email sent. Please check your new email address.")

      setNewEmail("")
    } catch (error: any) {
      toast.error(error.message || "Failed to update email")
    } finally {
      setEmailLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please log in to access security settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            You need to be logged in to manage your security settings.
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
            <Mail className="h-5 w-5" />
            Change Email
          </CardTitle>
          <CardDescription>Update your email address. You'll need to confirm the new email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleEmailChange} disabled={emailLoading}>
            {emailLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Confirmation Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Two-factor authentication is not enabled</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Button variant="outline" disabled>
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
