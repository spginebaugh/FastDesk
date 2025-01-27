import { format } from 'date-fns'
import { OrganizationMemberWithProfile } from '../../services/organizationService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { OrganizationRoleBadge } from '@/components/shared/OrganizationRoleBadge'

interface AgentProfileProps {
  agent: OrganizationMemberWithProfile
}

export function AgentProfile({ agent }: AgentProfileProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Basic Information */}
      <Card className="bg-background border-border/50">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              <AvatarImage src={agent.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-background-accent">
                {agent.profile.full_name?.[0]?.toUpperCase() || agent.profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{agent.profile.full_name || 'Unknown'}</h2>
              <p className="text-muted-foreground">{agent.profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">
                <UserStatusBadge status={agent.profile.user_status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
              <div className="mt-1">
                <OrganizationRoleBadge role={agent.organization_role} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Joined Organization</h3>
              <p className="mt-1">
                {agent.created_at 
                  ? format(new Date(agent.created_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="mt-1">
                {agent.updated_at
                  ? format(new Date(agent.updated_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-background border-border/50">
        <CardHeader>
          <CardTitle>Activity Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Tickets</h3>
              <p className="mt-1">Coming soon</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Resolved Tickets</h3>
              <p className="mt-1">Coming soon</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Average Response Time</h3>
              <p className="mt-1">Coming soon</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Customer Satisfaction</h3>
              <p className="mt-1">Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 