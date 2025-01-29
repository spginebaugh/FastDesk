import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { type TiptapContent } from '@/lib/tiptap'
import { useEffect } from 'react'

interface TiptapViewerProps {
  content: TiptapContent
  className?: string
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      // Only update if content is different to avoid unnecessary re-renders
      const currentContent = editor.getJSON()
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, content])

  return <EditorContent editor={editor} className={className} />
} 