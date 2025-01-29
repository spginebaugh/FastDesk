import { type Json } from '@/types/database'

export interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  [key: string]: Json | undefined
}

export interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
  [key: string]: Json | undefined
}

function isTiptapContent(content: Json): content is TiptapContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    !Array.isArray(content) &&
    'type' in content &&
    content.type === 'doc' &&
    'content' in content &&
    Array.isArray(content.content)
  )
}

export function extractPlainText(content: Json | null): string {
  if (!content) return ''
  
  try {
    if (!isTiptapContent(content)) {
      return String(content)
    }

    return content.content
      .map(node => {
        if (node.type === 'paragraph') {
          return node.content
            ?.map(child => child.type === 'text' ? child.text || '' : '')
            .join('') || ''
        }
        return ''
      })
      .join('\n')
  } catch (error) {
    console.error('Error extracting plain text from TipTap content:', error)
    return String(content)
  }
}

export function createTiptapContent(text: string): TiptapContent {
  if (!text.trim()) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph'
        }
      ]
    }
  }

  return {
    type: 'doc',
    content: text.split('\n').map(paragraph => ({
      type: 'paragraph',
      content: paragraph.trim() ? [
        {
          type: 'text',
          text: paragraph
        }
      ] : undefined
    }))
  }
} 