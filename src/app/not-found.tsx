"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Custom404() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button asChild className="cursor-pointer">
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={handleGoBack} className="cursor-pointer">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}