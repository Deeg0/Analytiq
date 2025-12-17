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
        <h3 className="text-lg font-semibold">Analyze a Study</h3>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="text">Text/Abstract</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="space-y-4 mt-0">
            <div className="space-y-3">
              <Label htmlFor="url-input">Enter Study URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/study or https://example.com/study.pdf"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border space-y-2">
                <div>
                  <p className="font-medium mb-1.5 text-foreground/90">Supported formats:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Web pages (HTML articles, journals)</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-muted-foreground/60">•</span>
                      <span>PDF files <span className="text-muted-foreground/70">(.pdf)</span></span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-muted-foreground/60">•</span>
                      <span>DOI links <span className="text-muted-foreground/70">(doi.org)</span></span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Journal sites <span className="text-muted-foreground/70">(PubMed, arXiv, etc.)</span></span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="font-medium mb-1 text-foreground/90">Requirements:</p>
                  <div className="space-y-0.5 ml-1 text-muted-foreground/80">
                    <p>• Publicly accessible content</p>
                    <p>• PDFs under 10MB</p>
                    <p>• Must use http:// or https://</p>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => analyzeUrl(url)}
              disabled={loading || !url}
            >
              {loading ? 'Analyzing...' : 'Analyze Study'}
            </Button>
          </TabsContent>
          <TabsContent value="text" className="space-y-4 mt-0">
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
      </CardContent>
      {loading && (
        <CardContent className="flex justify-center items-center py-8 border-t">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

