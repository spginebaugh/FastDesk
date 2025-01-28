import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/authStore'
import { ticketService } from '@/features/tickets/services/ticketService'
import { supabase } from '@/config/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [profileType, setProfileType] = useState('worker')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signUp(email, password, name, profileType)
      
      // Get the user data from supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create a sample ticket for the new user
      if (user?.id) {
        try {
          await ticketService.createSampleTicket(user.id)
        } catch (error) {
          console.error('Failed to create sample ticket:', error)
          // Don't throw here - we still want to complete signup even if sample ticket fails
        }
      }

      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
      })
      navigate('/login')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      <div className="w-full max-w-md px-4 relative">
        <Card className="w-full border-border/50 bg-background-raised shadow-2xl shadow-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground">Create an account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className={cn(
                    "bg-background border-border/50 text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-primary"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className={cn(
                    "bg-background border-border/50 text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-primary"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className={cn(
                    "bg-background border-border/50 text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-primary"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileType" className="text-foreground">Select Profile Type</Label>
                <Select
                  value={profileType}
                  onValueChange={setProfileType}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    className={cn(
                      "bg-background border-border/50 text-foreground",
                      "focus:ring-primary"
                    )}
                  >
                    <SelectValue placeholder="Select profile type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background-raised border-border/50">
                    <SelectItem 
                      value="worker"
                      className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      Worker
                    </SelectItem>
                    <SelectItem 
                      value="customer"
                      className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      Customer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className={cn(
                  "w-full bg-primary hover:bg-primary/90",
                  "transition-colors duration-200",
                  isLoading && "opacity-50"
                )} 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-border/50 pt-4">
              <div className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/90 hover:underline transition-colors">
                  Sign in
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:text-primary/90 hover:underline transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary/90 hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 