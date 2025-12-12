'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAnalysis } from '@/lib/contexts/AnalysisContext'

export default function InputSection() {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const { analyzeUrl, analyzeText, loading } = useAnalysis()

  return (
    <Card className="mb-4 sm:mb-6 md:mb-8">
      <CardHeader className="p-4 sm:p-6">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="url" className="text-xs sm:text-sm py-2 px-3 sm:px-4">
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs sm:text-sm py-2 px-3 sm:px-4">
              <span className="hidden sm:inline">Text/Abstract</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm sm:text-base">Enter Study URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/research-study"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <Button 
              className="w-full text-sm sm:text-base h-10 sm:h-11" 
              onClick={() => analyzeUrl(url)}
              disabled={loading || !url}
            >
              {loading ? 'Analyzing...' : 'Analyze Study'}
            </Button>
          </TabsContent>
          <TabsContent value="text" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-sm sm:text-base">Paste Study Text or Abstract</Label>
              <Textarea
                id="text-input"
                placeholder="Paste the study text, abstract, or full content here..."
                rows={6}
                className="text-sm sm:text-base min-h-[120px] sm:min-h-[160px] resize-y"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button 
              className="w-full text-sm sm:text-base h-10 sm:h-11" 
              onClick={() => analyzeText(text)}
              disabled={loading || text.length < 100}
            >
              {loading ? 'Analyzing...' : 'Analyze Study'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardHeader>
      {loading && (
        <CardContent className="flex justify-center items-center py-8">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

