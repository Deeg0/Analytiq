# Migration Guide: Converting AnalytIQ to Next.js

This guide outlines the steps to convert your current static HTML/CSS/JS frontend + Express backend architecture to a Next.js application.

## Current Architecture

- **Frontend**: Static HTML/CSS/JS in `frontend/public/`
- **Backend**: Express.js API in `backend/src/`
- **Authentication**: Supabase (client-side)
- **Styling**: Tailwind CSS (via CDN)
- **Deployment**: Frontend on Netlify, Backend on Railway

## Target Architecture

- **Full Stack Next.js App**: Single application with API routes
- **Authentication**: Supabase (server-side + client-side)
- **Styling**: Tailwind CSS + shadcn/ui components
- **UI Components**: shadcn/ui component library
- **Deployment**: Single deployment (Vercel recommended)

---

## Step 1: Initialize Next.js Project

### 1.1 Create New Next.js App

```bash
cd /Users/davidlomelin/Desktop/AItok
npx create-next-app@latest analytiq-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### 1.2 Project Structure

Your new structure will be:
```
analytiq-nextjs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   └── ...
├── components/
├── lib/
├── public/
├── package.json
└── ...
```

---

## Step 2: Install Dependencies

### 2.1 Install Required Packages

```bash
cd analytiq-nextjs
npm install @supabase/supabase-js @supabase/ssr
npm install openai axios pdf-parse cheerio
npm install @types/node @types/express
```

### 2.2 Install Dev Dependencies

```bash
npm install -D @types/pdf-parse
```

### 2.3 Install shadcn/ui Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tabs
npm install @radix-ui/react-label @radix-ui/react-separator
```

---

## Step 2.5: Initialize shadcn/ui

### 2.5.1 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- **Would you like to use TypeScript?** → Yes
- **Which style would you like to use?** → Default
- **Which color would you like to use as base color?** → Slate
- **Where is your global CSS file?** → `app/globals.css`
- **Would you like to use CSS variables for colors?** → Yes
- **Where is your tailwind.config.js located?** → `tailwind.config.ts`
- **Configure the import alias for components?** → `@/components`
- **Configure the import alias for utils?** → `@/lib/utils`

### 2.5.2 Install Required shadcn/ui Components

Install the components you'll need:

```bash
# Core UI components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add tabs
npx shadcn@latest add dialog
npx shadcn@latest add separator
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add skeleton
npx shadcn@latest add progress
npx shadcn@latest add scroll-area
```

### 2.5.3 Create Utils File

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Step 3: Configure Tailwind CSS for shadcn/ui

### 3.1 Update `tailwind.config.ts`

shadcn/ui will generate a config, but update it with your custom colors:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

Note: Install `tailwindcss-animate`:
```bash
npm install -D tailwindcss-animate
```

### 3.2 Update `app/globals.css`

shadcn/ui will automatically add the base styles. Add your custom CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Your custom styles from styles.css */
/* Logo and Header Styling */
header img {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

/* ... rest of your custom CSS ... */
```

---

## Step 4: Set Up Supabase

### 4.1 Create Supabase Client Utilities

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 4.2 Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Step 5: Migrate Backend API to Next.js API Routes

### 5.1 Create API Route Structure

Create `app/api/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { inputType, content } = body

    // Call your existing analysis service
    const result = await analyzeStudy({ inputType, content })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}
```

### 5.2 Migrate Backend Services

Copy all files from `backend/src/services/` to `lib/services/`:
- `analysisService.ts`
- `doiResolver.ts`
- `metadataExtractor.ts`
- `openaiService.ts`
- `pdfParser.ts`
- `scorer.ts`
- `summarizer.ts`
- `urlScraper.ts`

Copy types from `backend/src/types/` to `lib/types/`:
- `analysis.ts`

Copy utilities from `backend/src/utils/` to `lib/utils/`:
- `prompts.ts`

### 5.3 Update Imports

Update all imports in the migrated files to use Next.js paths:
- Change relative imports to use `@/lib/...`
- Remove Express-specific code
- Update OpenAI service to use environment variables directly

---

## Step 6: Convert Frontend Components Using shadcn/ui

### 6.1 Create Main Page Component

Create `app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import LoginPrompt from '@/components/LoginPrompt'
import InputSection from '@/components/InputSection'
import ResultsSection from '@/components/ResultsSection'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header user={user} />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
        <Hero />
        {user ? <InputSection /> : <LoginPrompt />}
        <ResultsSection />
      </main>
    </div>
  )
}
```

### 6.2 Create Components Using shadcn/ui

#### 6.2.1 Header Component (`components/Header.tsx`)

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function Header({ user }: { user: any }) {
  const supabase = createClient()

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
    }
  }

  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
              <Image 
                src="/assets/AnalytIQlogo.png" 
                alt="AnalytIQ Logo" 
                width={64} 
                height={64}
                className="h-10 sm:h-14 md:h-16 w-auto drop-shadow-lg relative z-10"
              />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Analyt<span className="text-primary">IQ</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
            )}
            <Button
              onClick={user ? handleSignOut : () => {/* Show auth modal */}}
              variant={user ? "outline" : "default"}
            >
              {user ? 'Sign Out' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### 6.2.2 Hero Component (`components/Hero.tsx`)

```typescript
export default function Hero() {
  return (
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <div className="inline-block mb-4 sm:mb-6 md:mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl"></div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 relative z-10 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-normal px-2 pb-1">
          Scientific Study<br />Analysis
        </h2>
      </div>
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-2">
        AI-powered analysis of scientific research credibility, bias, and reliability
      </p>
    </div>
  )
}
```

#### 6.2.3 Login Prompt Component (`components/LoginPrompt.tsx`)

```typescript
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
        <Button size="lg" onClick={() => {/* Show auth modal */}}>
          Sign In
        </Button>
        <Button size="lg" variant="outline" onClick={() => {/* Show auth modal */}}>
          Sign Up
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### 6.2.4 Input Section Component (`components/InputSection.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAnalysis } from '@/lib/hooks/useAnalysis'

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
```

#### 6.2.5 Results Section Component (`components/ResultsSection.tsx`)

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAnalysis } from '@/lib/hooks/useAnalysis'

export default function ResultsSection() {
  const { results, error } = useAnalysis()

  if (!results && !error) return null

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

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
                    <h4 className="font-semibold mb-2">{key}</h4>
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
            <TabsContent value="simple">
              <p className="text-muted-foreground">{results.simpleSummary}</p>
            </TabsContent>
            <TabsContent value="technical">
              <p className="text-muted-foreground mb-4">{results.technicalCritique}</p>
              <Separator className="my-4" />
              {/* Add category details, issues, etc. */}
            </TabsContent>
            <TabsContent value="bias">
              <p className="text-muted-foreground">{results.biasReport}</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 6.2.6 Auth Modal Component (`components/AuthModal.tsx`)

```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'
import { signIn, signUp, signInWithGoogle } from '@/app/actions/auth'

export default function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password)
      setError('Sign up successful! Please check your email.')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to AnalytIQ</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
              <Separator />
              <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
                Sign in with Google
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">Sign Up</Button>
              <Separator />
              <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
                Sign up with Google
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

### 6.3 Convert JavaScript Functions to React Hooks

Convert your JS files to React hooks and utilities:

**`lib/hooks/useAnalysis.ts`**:
```typescript
'use client'

import { useState } from 'react'

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeUrl = async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'url', content: url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const analyzeText = async (text: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'text', content: text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { analyzeUrl, analyzeText, loading, results, error }
}
```

### 6.4 shadcn/ui Component Mapping

Here's how your current HTML elements map to shadcn/ui components:

| Current HTML/CSS | shadcn/ui Component | Usage |
|-----------------|---------------------|-------|
| Buttons | `<Button>` | All buttons (sign in, analyze, etc.) |
| Cards/Sections | `<Card>`, `<CardHeader>`, `<CardContent>` | Input section, results sections |
| Input fields | `<Input>` | URL input, email input |
| Textarea | `<Textarea>` | Text/abstract input |
| Tabs | `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` | URL/Text tabs, view toggles |
| Modal/Dialog | `<Dialog>`, `<DialogContent>` | Auth modal |
| Labels | `<Label>` | Form labels |
| Badges | `<Badge>` | Severity badges, category scores |
| Progress bars | `<Progress>` | Category score progress bars |
| Alerts | `<Alert>`, `<AlertDescription>` | Error messages, success messages |
| Separators | `<Separator>` | Dividers between sections |
| Loading states | `<Skeleton>` | Loading placeholders |
| Scroll areas | `<ScrollArea>` | Long content sections |

---

## Step 7: Update Authentication Flow

### 7.1 Create Auth Actions

Create `app/actions/auth.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  revalidatePath('/', 'layout')
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  revalidatePath('/', 'layout')
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  revalidatePath('/', 'layout')
}
```

### 7.2 Create Middleware for Auth

Create `middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Step 8: Move Static Assets

### 8.1 Copy Public Assets

Copy all files from `frontend/public/` to `public/`:
- `assets/AnalytIQlogo.png`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon.png`

---

## Step 9: Update Environment Variables

### 9.1 Production Environment

For Vercel deployment, add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

---

## Step 10: Testing & Deployment

### 10.1 Local Development

```bash
npm run dev
```

Test all functionality:
- Authentication (sign in/up/out)
- Study analysis (URL and text)
- Results display
- Mobile responsiveness

### 10.2 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Build your Next.js app
- Set up API routes
- Handle serverless functions

---

## Key Differences & Considerations

### 1. **Server vs Client Components**
- Use `'use client'` for interactive components
- Use server components for data fetching
- API routes are server-side only

### 2. **API Calls**
- Replace `fetch('/api/analyze')` with `fetch('/api/analyze')` (same domain)
- No CORS issues since it's same origin
- Can use server actions for form submissions

### 3. **Authentication**
- Use Supabase SSR for server-side auth checks
- Use Supabase client for client-side interactions
- Middleware handles session refresh

### 4. **State Management**
- Replace vanilla JS state with React hooks
- Use `useState` for local state
- Consider Context API for global state

### 5. **Styling**
- Tailwind CSS via npm (not CDN)
- Custom CSS in `globals.css`
- CSS modules for component-specific styles

### 6. **Routing**
- File-based routing in `app/` directory
- API routes in `app/api/`
- Dynamic routes with `[param]`

---

## Migration Checklist

- [ ] Initialize Next.js project
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up Supabase (client + server)
- [ ] Migrate backend services to `lib/`
- [ ] Create API routes in `app/api/`
- [ ] Convert HTML to React components
- [ ] Convert JavaScript to React hooks
- [ ] Update authentication flow
- [ ] Move static assets
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Update Supabase redirect URLs
- [ ] Test production deployment

---

## Benefits of Next.js + shadcn/ui Migration

1. **Single Deployment**: One app instead of frontend + backend
2. **Better Performance**: Server-side rendering, automatic code splitting
3. **SEO**: Better search engine optimization
4. **Type Safety**: Full TypeScript support
5. **Developer Experience**: Hot reload, better tooling
6. **API Routes**: Built-in API endpoints (no separate Express server)
7. **Middleware**: Built-in auth middleware
8. **Optimization**: Automatic image optimization, font optimization
9. **Consistent UI**: shadcn/ui provides beautiful, accessible components
10. **Customizable**: Easy to customize shadcn/ui components
11. **Accessible**: All shadcn/ui components are accessible by default
12. **Maintainable**: Component-based architecture with reusable UI elements

---

## Important: Use Only shadcn/ui Components

**Do NOT create custom HTML/React components for UI elements.** Instead, use shadcn/ui components:

- ✅ Use `<Button>` from shadcn/ui instead of `<button>`
- ✅ Use `<Card>` instead of custom divs with styling
- ✅ Use `<Input>` and `<Textarea>` instead of raw HTML inputs
- ✅ Use `<Dialog>` instead of custom modals
- ✅ Use `<Tabs>` instead of custom tab implementations
- ✅ Use `<Badge>` for labels and tags
- ✅ Use `<Progress>` for progress bars
- ✅ Use `<Alert>` for error/success messages

All UI components should come from `@/components/ui/*` (shadcn/ui). Only create custom components for:
- Business logic components (like `InputSection`, `ResultsSection`)
- Layout components (like `Header`, `Hero`)
- Composite components that combine multiple shadcn/ui components

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Vercel Deployment](https://vercel.com/docs)

---

## Need Help?

If you encounter issues during migration:
1. Check Next.js documentation
2. Review Supabase SSR examples
3. Test components in isolation
4. Use Next.js dev tools for debugging

