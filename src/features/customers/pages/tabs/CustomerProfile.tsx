import { format } from 'date-fns'
import { Customer } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface CustomerProfileProps {
  customer: Customer
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={customer.avatar_url || undefined} />
              <AvatarFallback>
                {customer.full_name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.full_name || 'Unknown'}</h2>
              <p className="text-gray-500">{customer.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge 
                variant="outline" 
                className="mt-1 capitalize"
              >
                {customer.user_status}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company</h3>
              <p className="mt-1 text-gray-900">{customer.company || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-gray-900">
                {customer.created_at 
                  ? format(new Date(customer.created_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1 text-gray-900">
                {customer.updated_at
                  ? format(new Date(customer.updated_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customer.organizations?.map((org) => (
              <div 
                key={org.organization.id}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <span className="text-gray-900">{org.organization.name}</span>
              </div>
            ))}
            {(!customer.organizations || customer.organizations.length === 0) && (
              <p className="text-gray-500">No organizations</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Auth Provider</h3>
              <p className="mt-1 text-gray-900">{customer.auth_provider || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">External ID</h3>
              <p className="mt-1 text-gray-900">{customer.external_id || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
              <p className="mt-1 text-gray-900">
                {customer.last_login_at
                  ? format(new Date(customer.last_login_at), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Login Count</h3>
              <p className="mt-1 text-gray-900">{customer.login_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 