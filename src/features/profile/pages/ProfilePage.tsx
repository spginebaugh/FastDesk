import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { Database } from '@/types/database'
import { cn } from '@/lib/utils'

type UserStatus = Database['public']['Enums']['user_status']

export const ProfilePage = () => {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userStatus, setUserStatus] = useState<UserStatus>('offline')
  
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_status')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching user status:', error)
        return
      }
      
      if (data?.user_status) {
        setUserStatus(data.user_status as UserStatus)
      }
    }
    
    fetchUserStatus()
  }, [user?.id])
  
  if (!user) return null

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    try {
      // First verify the current password
      if (!user.email) {
        throw new Error("User email not found")
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // If current password is correct, proceed with password update
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Password updated successfully"
      })
      setIsDialogOpen(false)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback className="bg-background-accent">
                {user.user_metadata.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold glow-text">
                {user.user_metadata.full_name}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <UserStatusBadge status={userStatus} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
              <p className="mt-1">{user.user_metadata.company || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Sign In</h3>
              <p className="mt-1">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-background border-border/50">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border/50">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    className="bg-background-raised border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="bg-background-raised border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="bg-background-raised border-border/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full bg-primary hover:bg-primary/90 transition-colors duration-200",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )} 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage 