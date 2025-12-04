export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}