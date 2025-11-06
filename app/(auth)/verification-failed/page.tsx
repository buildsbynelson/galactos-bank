"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function VerificationFailedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              This verification link may have expired or is invalid. 
              Please request a new verification email.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
              <Button 
                onClick={() => router.push("/resend-verification")} 
                variant="outline" 
                className="w-full"
              >
                Resend Verification Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}