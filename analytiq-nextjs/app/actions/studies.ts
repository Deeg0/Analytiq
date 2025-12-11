'use server'

import { createClient } from '@/lib/supabase/server'
import { AnalysisResult } from '@/lib/types/analysis'
import { revalidatePath } from 'next/cache'

export interface SavedStudy {
  id: string
  user_id: string
  title: string
  input_type: 'url' | 'pdf' | 'doi' | 'text'
  input_content: string
  analysis_result: AnalysisResult
  created_at: string
  updated_at: string
}

export async function saveStudy(
  title: string,
  inputType: 'url' | 'pdf' | 'doi' | 'text',
  inputContent: string,
  analysisResult: AnalysisResult
) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be logged in to save studies')
  }

  const { data, error } = await supabase
    .from('saved_studies')
    .insert({
      user_id: session.user.id,
      title,
      input_type: inputType,
      input_content: inputContent,
      analysis_result: analysisResult,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save study: ${error.message}`)
  }

  revalidatePath('/saved')
  return data
}

export async function getSavedStudies(): Promise<SavedStudy[]> {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be logged in to view saved studies')
  }

  const { data, error } = await supabase
    .from('saved_studies')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch saved studies: ${error.message}`)
  }

  return data || []
}

export async function deleteSavedStudy(studyId: string) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be logged in to delete studies')
  }

  const { error } = await supabase
    .from('saved_studies')
    .delete()
    .eq('id', studyId)
    .eq('user_id', session.user.id)

  if (error) {
    throw new Error(`Failed to delete study: ${error.message}`)
  }

  revalidatePath('/saved')
}

export async function getSavedStudy(studyId: string): Promise<SavedStudy | null> {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be logged in to view saved studies')
  }

  const { data, error } = await supabase
    .from('saved_studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch saved study: ${error.message}`)
  }

  return data
}
