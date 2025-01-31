import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TICKET_PRIORITY_MAP } from '../types'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { useNewTicket } from '../hooks/useNewTicket'
import { TiptapEditor } from '@/components/ui/tiptap-editor'

export function NewTicketPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    title,
    content,
    initialSettings,
    organizations,
    workers,
    isLoadingWorkers,
    isPending,
    setTitle,
    setContent,
    handleSubmit,
    handleTicketPriorityChange,
    handleOrganizationChange,
    handleAssigneeChange
  } = useNewTicket(user?.id)

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-semibold glow-text">New Ticket</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Ticket Controls */}
        <div className="w-64 border-r border-border/50 bg-background p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Select
                value={initialSettings.organizationId}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>
                    {organizations.find(org => org.id === initialSettings.organizationId)?.name || 'Loading...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select
                value={initialSettings.assignee}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>
                    {isLoadingWorkers ? (
                      'Loading...'
                    ) : initialSettings.assignee === 'unassigned' ? (
                      'Unassigned'
                    ) : (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const worker = workers.find(a => a.id === initialSettings.assignee)
                          if (!worker) return 'Unassigned'
                          return (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={worker.avatar_url || undefined} />
                                <AvatarFallback>
                                  {worker.full_name?.[0]?.toUpperCase() || worker.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{worker.full_name || worker.email}</span>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={worker.avatar_url || undefined} />
                          <AvatarFallback>
                            {worker.full_name?.[0]?.toUpperCase() || worker.email[0].toUpperCase()}
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
              <Select
                value={initialSettings.ticket_priority}
                onValueChange={handleTicketPriorityChange}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_PRIORITY_MAP).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center">
                        <span className={TICKET_PRIORITY_MAP[value as keyof typeof TICKET_PRIORITY_MAP].color}>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Middle Section - New Ticket Form */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden bg-background">
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
            <div className="space-y-6 w-full">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ticket title"
                  className="bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Type your message..."
                  className="min-h-[200px] bg-background"
                  disabled={isPending}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tickets')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !title.trim() || !content.content.length}
                >
                  {isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section - Current User Profile */}
        <div className="w-80 border-l border-border/50 bg-background p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {user?.user_metadata?.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Company</h4>
                <p className="text-sm">{user?.user_metadata?.company || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <div className="mt-1">
                  <UserStatusBadge status={user?.user_metadata?.user_status || 'offline'} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Created</h4>
                <p className="text-sm">
                  {user?.created_at 
                    ? format(new Date(user.created_at), 'MMM d, yyyy')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 