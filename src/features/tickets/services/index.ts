import { getTicketById, queryTickets } from './ticket-query.service'
import { createTicket } from './create-ticket.service'
import { updateTicket } from './update-ticket.service'
import { getTicketMessages, createTicketMessage } from './ticket-messages.service'
import { 
  getTicketAssignment, 
  getOrganizationWorkers,
  updateTicketAssignment,
  getAllTicketAssignments
} from './ticket-assignments.service'
import { createSampleTicket } from './create-sample-ticket.service'

// Re-export with original names for backward compatibility
export const getTicket = getTicketById
export const getTickets = queryTickets

// Export other services as is
export {
  createTicket,
  updateTicket,
  getTicketMessages,
  createTicketMessage,
  getTicketAssignment,
  getOrganizationWorkers,
  updateTicketAssignment,
  getAllTicketAssignments,
  createSampleTicket
} 