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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>{user.user_metadata.full_name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.user_metadata.full_name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2">
                <UserStatusBadge status={userStatus} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-900">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-900">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                      className="text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-900">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      minLength={6}
                      className="text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-900">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      className="text-gray-900"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage 