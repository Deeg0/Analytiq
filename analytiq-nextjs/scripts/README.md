# Database Migration Scripts

## Apply Migration Manually (Recommended)

Since Supabase MCP is in read-only mode, apply the migration manually:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Copy the entire contents of `supabase/migrations/create_rate_limiting_and_analytics_tables.sql`
6. Paste into the SQL editor
7. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
8. Verify success - you should see "Success. No rows returned"

## Verify Migration

After applying, verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rate_limits', 'api_requests', 'user_activity_logs', 'openai_costs', 'user_analytics');
```

This should return 5 rows.

## Verify Function

Check that the function exists:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'increment_user_analytics';
```

This should return 1 row.
