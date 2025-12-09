'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAnalysis } from '@/lib/contexts/AnalysisContext'

export default function ResultsSection() {
  const { results, error } = useAnalysis()

  if (!results && !error) return null

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!results) return null

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl p-6 sm:p-8 md:p-10 text-primary-foreground mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/25 backdrop-blur-md border-4 border-white/40 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold">{results.trustScore.overall}</span>
                <span className="text-xs uppercase tracking-wider opacity-90 font-semibold">Score</span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                  {results.trustScore.rating}
                </h3>
                <p className="opacity-95 text-sm sm:text-base md:text-lg">
                  Analysis complete
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(results.trustScore.breakdown).map(([key, data]: [string, any]) => {
              const percentage = Math.round((data.score / data.maxScore) * 100)
              return (
                <Card key={key} className="cursor-pointer hover:bg-muted/70 transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="text-2xl font-bold mb-2">{data.score}/{data.maxScore}</div>
                    <Progress value={percentage} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple Summary</TabsTrigger>
              <TabsTrigger value="technical">Technical Critique</TabsTrigger>
              <TabsTrigger value="bias">Bias Report</TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="mt-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{results.simpleSummary}</p>
            </TabsContent>
            <TabsContent value="technical" className="mt-4">
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{results.technicalCritique}</p>
              <Separator className="my-4" />
              {/* Category details, issues, etc. will be added here */}
            </TabsContent>
            <TabsContent value="bias" className="mt-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{results.biasReport}</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

