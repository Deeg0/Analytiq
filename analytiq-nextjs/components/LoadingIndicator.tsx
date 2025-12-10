'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoadingIndicatorProps {
  progress: number
  estimatedTimeRemaining: number | null
}

export default function LoadingIndicator({ progress, estimatedTimeRemaining }: LoadingIndicatorProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (secs === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`
    }
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <Alert>
          <AlertDescription className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1">Analyzing study...</p>
                <p className="text-sm text-muted-foreground">
                  Processing content and generating comprehensive analysis
                </p>
              </div>
              {estimatedTimeRemaining !== null && (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {estimatedTimeRemaining > 0 
                      ? `~${formatTime(estimatedTimeRemaining)} remaining`
                      : 'Almost done...'
                    }
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% complete</span>
                {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                  <span>Estimated {formatTime(estimatedTimeRemaining)} remaining</span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
