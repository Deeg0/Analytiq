# Saved Analyses Feature Setup

This document explains how to set up the saved analyses feature in your Supabase database.

## Database Migration

The saved analyses feature requires a new table in your Supabase database. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/create_saved_analyses.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd analytiq-nextjs
supabase db push
```

## What the Migration Creates

The migration creates:

1. **`saved_analyses` table** with the following columns:
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users)
   - `title` (TEXT)
   - `analysis_data` (JSONB, stores the full analysis result)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **Indexes** for performance:
   - Index on `user_id` for faster user queries
   - Index on `created_at` for sorting

3. **Row Level Security (RLS) policies**:
   - Users can only view their own saved analyses
   - Users can only insert their own saved analyses
   - Users can only update their own saved analyses
   - Users can only delete their own saved analyses

4. **Automatic timestamp update**:
   - Trigger that automatically updates `updated_at` when a record is modified

## Features

Once set up, users can:

1. **Save analyses** after analyzing a study
2. **View saved analyses** at `/saved`
3. **Delete saved analyses** they no longer need
4. **View full analysis details** from saved analyses

## API Endpoints

- `GET /api/saved-analyses` - Fetch all saved analyses for the current user
- `POST /api/saved-analyses` - Save a new analysis
- `DELETE /api/saved-analyses/[id]` - Delete a saved analysis
- `PUT /api/saved-analyses/[id]` - Update a saved analysis (e.g., change title)

## Testing

1. Sign in to your application
2. Analyze a study
3. Click the "Save Analysis" button
4. Navigate to "Saved Analyses" in the header
5. View or delete your saved analyses
