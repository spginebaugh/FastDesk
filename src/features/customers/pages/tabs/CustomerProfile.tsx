import { format } from 'date-fns'
import { Customer } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'

interface CustomerProfileProps {
  customer: Customer
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
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
              <AvatarImage src={customer.avatar_url || undefined} />
              <AvatarFallback className="bg-background-accent">
                {customer.full_name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{customer.full_name || 'Unknown'}</h2>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">
                <UserStatusBadge status={customer.user_status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
              <p className="mt-1">{customer.company || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">
                {customer.created_at 
                  ? format(new Date(customer.created_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="mt-1">
                {customer.updated_at
                  ? format(new Date(customer.updated_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card className="bg-background border-border/50">
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customer.organizations?.map((org) => (
              <div 
                key={org.organization.id}
                className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-background hover:bg-primary/5"
              >
                <span>{org.organization.name}</span>
              </div>
            ))}
            {(!customer.organizations || customer.organizations.length === 0) && (
              <p className="text-muted-foreground">No organizations</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-background border-border/50">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Auth Provider</h3>
              <p className="mt-1">{customer.auth_provider || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">External ID</h3>
              <p className="mt-1">{customer.external_id || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
              <p className="mt-1">
                {customer.last_login_at
                  ? format(new Date(customer.last_login_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Login Count</h3>
              <p className="mt-1">{customer.login_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 