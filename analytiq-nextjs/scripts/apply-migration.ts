/**
 * Script to apply database migration
 * Run with: npx tsx scripts/apply-migration.ts
 * Or: ts-node scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required (use service role key, not anon key)')
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read migration file
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'create_rate_limiting_and_analytics_tables.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('Applying migration...')
  console.log('Migration file:', migrationPath)

  // Execute migration
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

  if (error) {
    // If exec_sql doesn't exist, try direct query
    console.log('RPC not available, trying direct execution...')
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error: execError } = await supabase.from('_migrations').select('*').limit(0)
          // This is a workaround - we'll need to use the REST API or SQL editor
          console.log('Statement:', statement.substring(0, 100) + '...')
        } catch (e) {
          console.error('Error executing statement:', e)
        }
      }
    }

    console.error('Migration failed:', error)
    console.log('\n⚠️  Automatic migration not available.')
    console.log('Please apply the migration manually:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of:')
    console.log(`   ${migrationPath}`)
    console.log('5. Click "Run"')
    process.exit(1)
  }

  console.log('✅ Migration applied successfully!')
  console.log('Data:', data)
}

applyMigration().catch((error) => {
  console.error('Failed to apply migration:', error)
  process.exit(1)
})
