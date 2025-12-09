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
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="text">Text/Abstract</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Enter Study URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/research-study"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => analyzeUrl(url)}
              disabled={loading || !url}
            >
              {loading ? 'Analyzing...' : 'Analyze Study'}
            </Button>
          </TabsContent>
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Paste Study Text or Abstract</Label>
              <Textarea
                id="text-input"
                placeholder="Paste the study text, abstract, or full content here..."
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => analyzeText(text)}
              disabled={loading || text.length < 100}
            >
              {loading ? 'Analyzing...' : 'Analyze Study'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
}

