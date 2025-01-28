import { useState } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { organizationService } from '../services/organizationService'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Database } from '@/types/database'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { cn } from '@/lib/utils'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  memberType: 'worker' | 'customer'
}

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj === 'object' && 'id' in obj && 'email' in obj && 'user_status' in obj
}

export function AddMemberModal({ isOpen, onClose, organizationId, memberType }: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Get available users of the specified type
  const { data: availableUsers = [] } = useQuery<UserProfile[]>({
    queryKey: ['available-users', memberType],
    queryFn: async () => {
      const response = await organizationService.getAvailableUsers(memberType)
      if (Array.isArray(response) && response.length > 0 && isUserProfile(response[0])) {
        return response as UserProfile[]
      }
      throw new Error('Failed to fetch users')
    }
  })

  // Get existing organization members to exclude them
  const { data: existingMembers = [] } = useQuery<OrganizationMember[]>({
    queryKey: ['organization-members', organizationId, memberType],
    queryFn: async () => {
      const response = await organizationService.getOrganizationMembers(organizationId, memberType)
      return response as OrganizationMember[]
    }
  })

  const existingMemberIds = new Set(existingMembers.map(member => member.profile_id))

  const filteredUsers = availableUsers.filter((user: UserProfile) => 
    !existingMemberIds.has(user.id) &&
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const addMembersMutation = useMutation({
    mutationFn: (userIds: string[]) => organizationService.addOrganizationMembers({
      organizationId,
      userIds,
      role: memberType === 'worker' ? 'member' : 'customer'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['organization-members', organizationId, memberType]
      })
      toast({
        title: 'Members added',
        description: `Successfully added ${selectedUsers.size} ${memberType}${selectedUsers.size !== 1 ? 's' : ''} to the organization`,
      })
      setSelectedUsers(new Set())
      onClose()
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUsers.size === 0) return

    await addMembersMutation.mutateAsync(Array.from(selectedUsers))
  }

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background-raised border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add {memberType === 'worker' ? 'Workers' : 'Customers'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select {memberType}s to add to your organization. You can add multiple {memberType}s at once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${memberType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-8 bg-background border-border/50 text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:ring-primary"
                )}
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredUsers.length} available {memberType}{filteredUsers.length !== 1 ? 's' : ''}
            </div>
            <div className="border border-border/50 rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="text-foreground">{memberType === 'worker' ? 'Worker' : 'Customer'}</TableHead>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: UserProfile) => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer border-border/50 hover:bg-primary/5"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="text-foreground" onClick={() => toggleUser(user.id)}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-background-accent text-foreground">
                              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground" onClick={() => toggleUser(user.id)}>
                        {user.email}
                      </TableCell>
                      <TableCell onClick={() => toggleUser(user.id)}>
                        <UserStatusBadge status={user.user_status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addMembersMutation.isPending}
              className="text-foreground hover:text-primary hover:bg-primary/10 border-border/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={selectedUsers.size === 0 || addMembersMutation.isPending}
              className={cn(
                "bg-primary hover:bg-primary/90",
                "transition-colors duration-200",
                (selectedUsers.size === 0 || addMembersMutation.isPending) && "opacity-50"
              )}
            >
              {addMembersMutation.isPending 
                ? 'Adding...' 
                : `Add ${selectedUsers.size} ${memberType}${selectedUsers.size !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 