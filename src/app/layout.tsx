import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/ui/theme-provider"
import ConditionalLayout from "@/components/conditional-layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "SchoolPlayground - Your All-in-One School Helper",
  description: "Access tools for grade calculation, study resources, homework planning, exam preparation, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Analytics />
            <Toaster richColors position="top-right" />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
