import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { type TiptapContent } from '@/lib/tiptap'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface TiptapEditorProps {
  content: TiptapContent
  onChange?: (content: TiptapContent) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Type something...', 
  className,
  disabled = false 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyNodeClass: 'is-editor-empty',
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON() as TiptapContent)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
          'min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'max-h-[300px] overflow-y-auto',
          className
        )
      }
    }
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

  return (
    <div className={cn(
      'relative',
      '[&_.is-editor-empty]:before:text-muted-foreground',
      '[&_.is-editor-empty]:before:content-[attr(data-placeholder)]',
      '[&_.is-editor-empty]:before:float-left',
      '[&_.is-editor-empty]:before:pointer-events-none',
      '[&_.is-editor-empty]:before:h-0',
      '[&_.is-editor-empty]:before:absolute',
      '[&_.is-editor-empty]:before:top-[0.75rem]',
      '[&_.is-editor-empty]:before:left-[0.875rem]',
    )}>
      <EditorContent editor={editor} />
    </div>
  )
} 