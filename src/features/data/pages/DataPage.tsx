import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart } from '@/components/ui/pie-chart'
import { getTickets, getAllTicketAssignments } from '@/features/tickets/services'
import { organizationService } from '@/features/organizations/services/organizationService'
import { TICKET_STATUS_MAP } from '@/features/tickets/types'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2 } from 'lucide-react'

// Synthwave color palette for status
const STATUS_COLORS = {
  new: '#00fff2', // Bright cyan
  open: '#39ff14', // Neon green
  pending: '#fff01f', // Bright yellow
  resolved: '#b300ff', // Neon purple
  closed: '#ff00ff' // Hot pink
} as const

// Synthwave colors for assignment
const ASSIGNMENT_COLORS = {
  assigned: '#39ff14', // Neon green
  unassigned: '#ff00ff' // Hot pink
} as const

// Card styles with glow effects
const CARD_STYLES = {
  metrics: "bg-background border-border/50 shadow-[0_0_15px_rgba(0,255,242,0.5)] hover:shadow-[0_0_20px_rgba(0,255,242,0.7)] transition-shadow duration-300",
  charts: "bg-background border-border/50 shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] transition-shadow duration-300"
} as const

export function DataPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>()

  // Get organizations
  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations()
  })

  // Filter to only show organizations where user is a member
  const userOrganizations = organizations.filter(org => 
    org.organization_members && 
    org.organization_members.length > 0
  )

  // Get tickets for selected organization
  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['tickets-metrics', selectedOrgId],
    queryFn: () => getTickets({ 
      status: ['new', 'open', 'pending', 'resolved', 'closed'],
      organizationId: selectedOrgId 
    }),
    enabled: !!selectedOrgId
  })

  // Get assignments for selected organization
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['ticket-assignments', selectedOrgId],
    queryFn: () => getAllTicketAssignments({ organizationId: selectedOrgId }),
    enabled: !!selectedOrgId
  })

  // Set initial organization if none selected
  if (!selectedOrgId && userOrganizations.length > 0) {
    setSelectedOrgId(userOrganizations[0].id)
  }

  if (isLoadingOrgs || isLoadingTickets || isLoadingAssignments) {
    return (
      <div className="flex items-center justify-center h-full text-foreground">
        Loading...
      </div>
    )
  }

  // Calculate metrics
  const createdTickets = tickets.length
  const unsolvedTickets = tickets.filter(t => ['new', 'open', 'pending'].includes(t.ticket_status)).length
  const solvedTickets = tickets.filter(t => t.ticket_status === 'resolved').length

  // Calculate data for status pie chart
  const statusData = Object.entries(
    tickets.reduce((acc, ticket) => {
      if (!['resolved', 'closed'].includes(ticket.ticket_status)) {
        acc[ticket.ticket_status] = (acc[ticket.ticket_status] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: TICKET_STATUS_MAP[status as keyof typeof TICKET_STATUS_MAP].label,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
  }))

  // Calculate data for assignment pie chart
  const assignmentData = [
    {
      name: 'Assigned',
      value: assignments?.length || 0,
      color: ASSIGNMENT_COLORS.assigned
    },
    {
      name: 'Unassigned',
      value: tickets.length - (assignments?.length || 0),
      color: ASSIGNMENT_COLORS.unassigned
    }
  ]

  const selectedOrg = userOrganizations.find(org => org.id === selectedOrgId)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text">
          Data Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="w-[200px] bg-background border-border/50">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {userOrganizations.map(org => (
                <SelectItem 
                  key={org.id} 
                  value={org.id}
                  className="cursor-pointer"
                >
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedOrg ? (
        <>
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className={CARD_STYLES.metrics}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground glow-text">{createdTickets}</div>
              </CardContent>
            </Card>
            <Card className={CARD_STYLES.metrics}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsolved Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground glow-text">{unsolvedTickets}</div>
              </CardContent>
            </Card>
            <Card className={CARD_STYLES.metrics}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solved Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground glow-text">{solvedTickets}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={CARD_STYLES.charts}>
              <CardHeader>
                <CardTitle>Tickets by Status</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PieChart
                  data={statusData}
                  width={400}
                  height={300}
                />
              </CardContent>
            </Card>
            <Card className={CARD_STYLES.charts}>
              <CardHeader>
                <CardTitle>Assignment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PieChart
                  data={assignmentData}
                  width={400}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Select an organization to view data
        </div>
      )}
    </div>
  )
} 