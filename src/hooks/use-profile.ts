"use client"

import useSWR from "swr"
import { createBrowserClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface ProfileData {
  user: any
  profile: Profile | null
  avatarUrl: string
  avatarPath: string
}

const fetcher = async (): Promise<ProfileData | null> => {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  let avatarUrl = ""
  let avatarPath = ""

  if (profile?.avatar_url) {
    const storedAvatar = profile.avatar_url
    if (storedAvatar && !storedAvatar.startsWith("http")) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(storedAvatar)
      avatarUrl = publicUrl
      avatarPath = storedAvatar
    } else {
      avatarUrl = storedAvatar
    }
  } else if (user.user_metadata?.avatar_url) {
    const storedAvatar = user.user_metadata.avatar_url
    if (storedAvatar && !storedAvatar.startsWith("http")) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(storedAvatar)
      avatarUrl = publicUrl
      avatarPath = storedAvatar
    } else {
      avatarUrl = storedAvatar
    }
  }

  return {
    user,
    profile,
    avatarUrl,
    avatarPath,
  }
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<ProfileData | null>("profile", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  return {
    user: data?.user,
    profile: data?.profile,
    avatarUrl: data?.avatarUrl || "",
    avatarPath: data?.avatarPath || "",
    isLoading,
    error,
    mutate,
  }
}
