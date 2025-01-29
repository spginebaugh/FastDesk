import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TicketStatus, TicketPriority } from '../types'
import { TicketStatusSelect } from '@/components/shared/TicketStatusSelect'
import { TicketPrioritySelect } from '@/components/shared/TicketPrioritySelect'

interface Worker {
  id: string
  full_name?: string | null
  email: string
  avatar_url?: string | null
}

interface TicketControlsProps {
  ticketStatus: TicketStatus
  ticketPriority: TicketPriority
  currentAssignment: Worker | null
  availableWorkers: Worker[]
  onStatusChange: (status: TicketStatus) => void
  onPriorityChange: (priority: TicketPriority) => void
  onAssigneeChange: (assigneeId: string) => void
  onSaveChanges: () => void
  hasChanges: boolean
}

export function TicketControls({
  ticketStatus,
  ticketPriority,
  currentAssignment,
  availableWorkers,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSaveChanges,
  hasChanges
}: TicketControlsProps) {
  return (
    <div className="w-64 border-r border-border/50 bg-background p-4 flex flex-col">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <TicketStatusSelect
            value={ticketStatus}
            onValueChange={onStatusChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assignee</label>
          <Select
            value={currentAssignment ? currentAssignment.id : 'unassigned'}
            onValueChange={onAssigneeChange}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue>
                {currentAssignment ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentAssignment.avatar_url || undefined} />
                      <AvatarFallback>
                        {currentAssignment.full_name?.[0]?.toUpperCase() || currentAssignment.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{currentAssignment.full_name || currentAssignment.email}</span>
                  </div>
                ) : (
                  'Unassigned'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                <span className="text-muted-foreground">Unassigned</span>
              </SelectItem>
              {availableWorkers.map((worker) => (
                <SelectItem key={worker.id} value={worker.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={worker.avatar_url || undefined} />
                      <AvatarFallback>
                        {worker.full_name?.[0]?.toUpperCase() || worker.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{worker.full_name || worker.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <TicketPrioritySelect
            value={ticketPriority}
            onValueChange={onPriorityChange}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 mt-4">
        <Button 
          className="w-full"
          onClick={onSaveChanges}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
} 