import { useState } from 'react'
import { type TiptapContent } from '@/lib/tiptap'
import { responseGenerationService, responseEditingService } from '@/features/ai-bot/services'
import { type Message } from '@/features/ai-bot/types'

const emptyTiptapContent: TiptapContent = {
  type: 'doc',
  content: []
}

interface UseAIResponseOptions {
  ticketTitle: string
  originalSenderFullName: string
  currentWorkerFullName?: string
  ticketContent: any
  previousMessages: Message[]
}

export function useAIResponse({
  ticketTitle,
  originalSenderFullName,
  currentWorkerFullName,
  ticketContent,
  previousMessages
}: UseAIResponseOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<TiptapContent>(emptyTiptapContent)

  const handleGenerateResponse = async () => {
    if (!previousMessages.length) return
    
    try {
      setIsGenerating(true)
      const response = await responseGenerationService.generateTicketResponse({
        ticketTitle,
        originalSenderFullName,
        currentWorkerFullName,
        ticketContent,
        previousMessages
      })
      setGeneratedContent(response)
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCustomResponse = async (prompt: string) => {
    try {
      setIsGenerating(true)
      const response = await responseGenerationService.generateCustomResponse({ prompt })
      setGeneratedContent(response)
    } catch (error) {
      console.error('Failed to generate custom AI response:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePromptWithContext = async (prompt: string) => {
    if (!previousMessages.length) return
    
    try {
      setIsGenerating(true)
      const response = await responseGenerationService.generatePromptWithContext({
        ticketTitle,
        originalSenderFullName,
        currentWorkerFullName,
        ticketContent,
        previousMessages,
        prompt
      })
      setGeneratedContent(response)
    } catch (error) {
      console.error('Failed to generate AI response with prompt:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditResponse = async (prompt: string) => {
    try {
      setIsGenerating(true)
      const response = await responseEditingService.editResponse({
        prompt,
        currentResponse: generatedContent
      })
      setGeneratedContent(response)
    } catch (error) {
      console.error('Failed to edit AI response:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditResponseWithContext = async (prompt: string) => {
    if (!previousMessages.length) return
    
    try {
      setIsGenerating(true)
      const response = await responseEditingService.editResponseWithContext({
        ticketTitle,
        originalSenderFullName,
        currentWorkerFullName,
        ticketContent,
        previousMessages,
        prompt,
        currentResponse: generatedContent
      })
      setGeneratedContent(response)
    } catch (error) {
      console.error('Failed to edit AI response with context:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generatedContent,
    setGeneratedContent,
    handleGenerateResponse,
    handleGenerateCustomResponse,
    handleGeneratePromptWithContext,
    handleEditResponse,
    handleEditResponseWithContext
  }
} 