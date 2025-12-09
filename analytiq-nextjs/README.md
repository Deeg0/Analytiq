# AnalytIQ - Next.js Version

AI-powered scientific study analysis application built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🔐 Supabase Authentication (Email/Password & Google OAuth)
- 🤖 AI-powered study analysis using OpenAI
- 📊 Trust score calculation and breakdown
- 🎨 Modern UI with shadcn/ui components
- 📱 Fully responsive design
- ⚡ Server-side rendering with Next.js

## Getting Started

### Prerequisites

- Node.js 20.18.1 or higher
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
analytiq-nextjs/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Auth routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Library code
│   ├── contexts/        # React contexts
│   ├── services/        # Business logic
│   ├── supabase/        # Supabase clients
│   └── types/           # TypeScript types
└── public/              # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Cloudflare Pages

## Migration from Original App

This is a Next.js migration of the original static HTML/CSS/JS application. Key changes:

- **Framework**: Vanilla JS → Next.js (React)
- **Styling**: Custom CSS → Tailwind CSS + shadcn/ui
- **API**: Express backend → Next.js API routes
- **State Management**: Global variables → React Context
- **Authentication**: Client-side only → Server + Client components

See `MIGRATE_TO_NEXTJS.md` in the parent directory for detailed migration guide.

## License

MIT
