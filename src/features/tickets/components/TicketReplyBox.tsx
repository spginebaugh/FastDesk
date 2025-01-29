import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useTicketReply } from '../hooks/useTicketReply'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { type TiptapContent } from '@/lib/tiptap'
import { type Json } from '@/types/database'

interface TicketReplyBoxProps {
  ticketId: string
  ticketTitle: string
  ticketContent: Json
  originalSenderFullName: string
  currentWorkerFullName?: string
  previousMessages: Array<{
    content: Json
    role: 'user' | 'worker'
    senderFullName: string
  }>
  rightElement?: ReactNode
  initialContent?: TiptapContent
  onSetContent?: (content: TiptapContent) => void
}

export function TicketReplyBox({ 
  ticketId, 
  ticketTitle,
  ticketContent, 
  originalSenderFullName,
  currentWorkerFullName,
  previousMessages,
  rightElement,
  initialContent,
  onSetContent
}: TicketReplyBoxProps) {
  const {
    content,
    isGenerating,
    isPending,
    handleSubmit,
    handleContentChange,
    handleReplyTypeChange,
    handleGenerateResponse,
    setContent
  } = useTicketReply({
    ticketId,
    ticketTitle,
    ticketContent,
    originalSenderFullName,
    currentWorkerFullName,
    previousMessages,
    initialContent,
    onSetContent
  })

  return (
    <form onSubmit={handleSubmit} className="border-t border-border/50 bg-background-alt p-4">
      <div className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Type your reply..."
          className={cn(
            "min-h-[100px] bg-background border-border/50 text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:ring-primary"
          )}
          disabled={isPending}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={handleReplyTypeChange}
              defaultValue="public"
            >
              <SelectTrigger 
                className={cn(
                  "w-[140px] bg-background border-border/50",
                  "text-foreground hover:bg-primary/10",
                  "focus:ring-primary"
                )}
              >
                <SelectValue placeholder="Select reply type" />
              </SelectTrigger>
              <SelectContent className="bg-background-raised border-border/50">
                <SelectItem 
                  value="public"
                  className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  Public reply
                </SelectItem>
                <SelectItem 
                  value="internal"
                  className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  Internal note
                </SelectItem>
              </SelectContent>
            </Select>
            {rightElement}
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !content}
            className={cn(
              "bg-primary hover:bg-primary/90",
              "transition-colors duration-200",
              (isPending || !content) && "opacity-50"
            )}
          >
            {isPending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
} 