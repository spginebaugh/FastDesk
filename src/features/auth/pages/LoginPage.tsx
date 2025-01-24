import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
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
            <CardTitle className="text-2xl font-bold text-center text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
              <Button 
                className={cn(
                  "w-full bg-primary hover:bg-primary/90",
                  "transition-colors duration-200",
                  isLoading && "opacity-50"
                )} 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-border/50 pt-4">
              <div className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/90 hover:underline transition-colors">
                  Sign up
                </Link>
              </div>
              <Button 
                variant="link" 
                className="text-sm text-primary hover:text-primary/90 transition-colors"
              >
                Forgot your password?
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 