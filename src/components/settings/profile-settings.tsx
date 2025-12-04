"use client"

import React, { useState, type ReactElement } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, Trash2, LogIn } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useProfile } from "@/hooks/use-profile"
import Link from "next/link"

export function ProfileSettings(): ReactElement {
  const { user, profile, avatarUrl: cachedAvatarUrl, avatarPath: cachedAvatarPath, mutate } = useProfile()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(cachedAvatarUrl)
  const [avatarPath, setAvatarPath] = useState(cachedAvatarPath)
  const supabase = createBrowserClient()

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "")
      setBio(profile.bio || "")
    }
    if (cachedAvatarUrl) {
      setAvatarUrl(cachedAvatarUrl)
    }
    if (cachedAvatarPath) {
      setAvatarPath(cachedAvatarPath)
    }
  }, [profile, cachedAvatarUrl, cachedAvatarPath])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please log in to access your profile</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            You need to be logged in to view and manage your profile.
          </p>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (!user) throw new Error("No user found")

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        bio: bio,
        avatar_url: avatarPath || avatarUrl,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio: bio,
          avatar_url: avatarPath || avatarUrl,
        },
      })

      if (metadataError) throw metadataError

      mutate()

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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setUploading(true)
    try {
      if (!user) throw new Error("No user found")

      if (avatarPath) {
        await supabase.storage.from("avatars").remove([avatarPath])
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: filePath,
        display_name: displayName,
        bio: bio,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: filePath,
        },
      })

      if (metadataError) throw metadataError

      setAvatarUrl(publicUrl)
      setAvatarPath(filePath)

      mutate()

      toast.success("Avatar uploaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!avatarPath && !avatarUrl) {
      toast.error("No avatar to delete")
      return
    }

    setDeleting(true)
    try {
      if (!user) throw new Error("No user found")

      if (avatarPath) {
        const { error: deleteError } = await supabase.storage.from("avatars").remove([avatarPath])
        if (deleteError) throw deleteError
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: null,
        display_name: displayName,
        bio: bio,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      })

      if (metadataError) throw metadataError

      setAvatarUrl("")
      setAvatarPath("")

      mutate()

      toast.success("Avatar deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete avatar")
    } finally {
      setDeleting(false)
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
            <div className="flex gap-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploading || deleting} asChild>
                  <span>
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo
                  </span>
                </Button>
              </Label>
              {(avatarUrl || avatarPath) && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading || deleting}
                  onClick={handleAvatarDelete}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete
                </Button>
              )}
            </div>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading || deleting}
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
