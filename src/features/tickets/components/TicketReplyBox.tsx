import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useTicketReply } from '../hooks/useTicketReply'

interface TicketReplyBoxProps {
  ticketId: string
  ticketTitle: string
  ticketContent: string
  originalSenderFullName: string
  currentWorkerFullName?: string
  previousMessages: Array<{
    content: string
    role: 'user' | 'worker'
    senderFullName: string
  }>
}

export function TicketReplyBox({ 
  ticketId, 
  ticketTitle,
  ticketContent, 
  originalSenderFullName,
  currentWorkerFullName,
  previousMessages 
}: TicketReplyBoxProps) {
  const {
    content,
    isGenerating,
    isPending,
    handleSubmit,
    handleContentChange,
    handleReplyTypeChange,
    handleGenerateResponse
  } = useTicketReply({
    ticketId,
    ticketTitle,
    ticketContent,
    originalSenderFullName,
    currentWorkerFullName,
    previousMessages
  })

  return (
    <form onSubmit={handleSubmit} className="border-t border-border/50 bg-background-alt p-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Type your reply..."
          className={cn(
            "min-h-[100px] bg-background border-border/50 text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:ring-primary"
          )}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateResponse}
              disabled={isGenerating}
              className={cn(
                "border-border/50 text-foreground",
                "hover:bg-primary/10 hover:text-primary",
                "focus:ring-primary",
                isGenerating && "opacity-50"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Response'
              )}
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !content.trim()}
            className={cn(
              "bg-primary hover:bg-primary/90",
              "transition-colors duration-200",
              (isPending || !content.trim()) && "opacity-50"
            )}
          >
            {isPending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
} 