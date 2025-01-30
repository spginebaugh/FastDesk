import { LightbulbIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TicketSummaryLightbulbProps {
  summary: string | undefined
  className?: string
}

export function TicketSummaryLightbulb({ summary, className }: TicketSummaryLightbulbProps) {
  if (!summary) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 hover:bg-primary/10 hover:text-primary",
            "focus-visible:ring-1 focus-visible:ring-primary",
            className
          )}
        >
          <LightbulbIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <div className="p-2 space-y-2">
          <h4 className="font-medium text-sm">AI Summary</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
