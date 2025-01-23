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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black">Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
                className="text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter organization description (optional)"
                rows={3}
                className="text-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 