import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
            </div>
            <CardDescription>
              We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              After confirming your email, you can{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                log in
              </Link>{" "}
              to start tracking your grades.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
