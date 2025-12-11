# Saved Studies Feature

This document describes the new "Save Studies" feature that allows logged-in users to save their analyzed studies for later viewing.

## Overview

Users can now:
- Save analyzed studies while viewing results
- View all their saved studies in a dedicated page
- Delete saved studies
- View full analysis results for any saved study

## Database Setup

Before using this feature, you need to create the database table in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `analytiq-nextjs/supabase_migration.sql`

This will create:
- `saved_studies` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates

## Features Implemented

### 1. Save Study Button
- Location: `components/ResultsSection.tsx`
- Appears in the Overview card header when user is logged in
- Shows loading state while saving
- Shows success state after saving
- Displays error messages if save fails

### 2. Saved Studies Page
- Route: `/saved`
- Location: `app/saved/page.tsx`
- Features:
  - List of all saved studies with metadata
  - Click to view full analysis
  - Delete functionality
  - Empty state when no studies saved
  - Responsive layout (list on left, details on right)

### 3. Server Actions
- Location: `app/actions/studies.ts`
- Functions:
  - `saveStudy()` - Save a new study analysis
  - `getSavedStudies()` - Get all saved studies for current user
  - `deleteSavedStudy()` - Delete a saved study
  - `getSavedStudy()` - Get a single saved study by ID

### 4. Updated Components

#### AnalysisContext (`lib/contexts/AnalysisContext.tsx`)
- Added `user` to context
- Added `inputType` and `inputContent` tracking
- Added `setResults()` method to load saved studies into context

#### Header (`components/Header.tsx`)
- Added "Saved Studies" link (visible when logged in)
- Links to `/saved` page

## Usage

### For Users

1. **Saving a Study:**
   - Sign in to your account
   - Analyze a study (URL or text)
   - Click "Save Study" button in the results
   - Study is saved with title, input type, content, and full analysis

2. **Viewing Saved Studies:**
   - Click "Saved Studies" in the header
   - Browse your saved studies
   - Click any study to view its full analysis
   - Click trash icon to delete a study

### For Developers

The saved studies are stored in Supabase with the following structure:

```typescript
interface SavedStudy {
  id: string
  user_id: string
  title: string
  input_type: 'url' | 'pdf' | 'doi' | 'text'
  input_content: string
  analysis_result: AnalysisResult
  created_at: string
  updated_at: string
}
```

## Security

- Row Level Security (RLS) is enabled
- Users can only see/modify their own saved studies
- All database operations are server-side (server actions)
- Authentication is required for all operations

## Future Enhancements

Potential improvements:
- Edit study titles
- Add notes/tags to saved studies
- Search/filter saved studies
- Export saved studies
- Share saved studies (with permissions)
- Prevent duplicate saves (check if already saved)
