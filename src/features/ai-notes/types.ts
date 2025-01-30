import { type Database } from '@/types/database'

export type TargetType = 'tags' | 'notes' | 'both'
export type ActionType = 'update' | 'recreate'

export interface ParsedPrompt {
  targetType: TargetType
  action: ActionType
  originalPrompt: string
}

export interface UserContext {
  id: string
  fullName?: string | null
  email: string
  company?: string | null
  createdAt?: string | null
}

export interface NotesContext {
  existingNotes?: string
  existingTags?: string[]
}

export interface GenerationContext {
  user: UserContext
  notes: NotesContext
}

export interface GeneratedContent {
  notes?: string
  tags?: string[]
  explanation: string
}

export interface AINotesError {
  message: string
  code: 'PARSING_ERROR' | 'GENERATION_ERROR' | 'CONTEXT_ERROR'
  details?: unknown
}

export type AINotesResult = {
  success: true
  data: GeneratedContent
} | {
  success: false
  error: AINotesError
} 