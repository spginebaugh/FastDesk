import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { organizationService } from '../services/organizationService'
import { useTabStore } from '@/store/tabStore'
import { cn } from '@/lib/utils'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateOrganizationModal({ isOpen, onClose }: CreateOrganizationModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const tabStore = useTabStore()

  const createOrganizationMutation = useMutation({
    mutationFn: organizationService.createOrganization,
    onSuccess: (organization) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast({
        title: 'Organization created',
        description: `Successfully created organization "${organization.name}"`,
      })

      // Navigate to the new organization's page
      const path = `/organizations/${organization.id}/tickets`
      if (!tabStore.hasTab(path)) {
        tabStore.addTab({
          title: organization.name,
          path,
        })
      }
      navigate(path)
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
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await createOrganizationMutation.mutateAsync({ name, description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background-raised border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
                className={cn(
                  "bg-background border-border/50 text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:ring-primary"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter organization description (optional)"
                rows={3}
                className={cn(
                  "bg-background border-border/50 text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:ring-primary"
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-foreground hover:text-primary hover:bg-primary/10 border-border/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
              className={cn(
                "bg-primary hover:bg-primary/90",
                "transition-colors duration-200",
                (isSubmitting || !name.trim()) && "opacity-50"
              )}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 