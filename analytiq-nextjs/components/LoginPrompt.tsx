'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function LoginPrompt() {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="text-center">
        <div className="inline-block w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl">
          Sign In Required
        </CardTitle>
        <CardDescription className="text-base sm:text-lg">
          Please sign in or create an account to analyze scientific studies.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button size="lg" onClick={() => {/* Show auth modal - implement later */}}>
          Sign In
        </Button>
        <Button size="lg" variant="outline" onClick={() => {/* Show auth modal - implement later */}}>
          Sign Up
        </Button>
      </CardContent>
    </Card>
  )
}

