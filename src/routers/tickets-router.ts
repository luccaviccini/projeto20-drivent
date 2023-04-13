import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketTypes, getUserTickets, createTicket } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getUserTickets)
  .post('/', createTicket);

export { ticketsRouter };
