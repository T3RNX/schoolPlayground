"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[v0] Loaded user profile:", user?.user_metadata)
    if (user) {
      setUser(user)
      setDisplayName(user.user_metadata?.display_name || "")
      setBio(user.user_metadata?.bio || "")
      setAvatarUrl(user.user_metadata?.avatar_url || "")
    }
  }

  useEffect(() => {
    loadProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        console.log("[v0] Auth state changed, refreshing profile")
        loadProfile()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio: bio,
        },
      })

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setUploading(true)
    try {
      if (!user) throw new Error("No user found")

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log("[v0] Uploading avatar to:", filePath)

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      console.log("[v0] Generated public URL:", publicUrl)

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      })

      if (updateError) throw updateError

      console.log("[v0] Updated user metadata with avatar URL")

      await loadProfile()

      toast.success("Avatar uploaded successfully")
    } catch (error: any) {
      console.error("[v0] Avatar upload error:", error)
      toast.error(error.message || "Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile picture and personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName || user?.email} />
            <AvatarFallback className="text-2xl">
              {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-3">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Photo
                </span>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground mt-1.5">To change your email, go to the Security tab</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us a bit about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Brief description for your profile. Max 200 characters.
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
}
