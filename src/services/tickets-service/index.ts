import { notFoundError } from '@/errors';
import { TicketType, Ticket } from '@/protocols';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getTicketTypes(): Promise<TicketType[]> {
  const result = await ticketsRepository.getTicketTypes();
  if (!result) throw notFoundError();

  return result;
}

async function getUserTickets(userId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findEnrollment(userId);
  const result = await ticketsRepository.getUserTickets(enrollment.id);
  if (!result) throw notFoundError();
  return result;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  const query = await enrollmentRepository.findEnrollment(userId);
  console.log(query);

  if (!query) throw notFoundError();

  const result = await ticketsRepository.createTicket(query.id, ticketTypeId);
  if (!result) throw notFoundError();

  return result;
}

const ticketsService = {
  getTicketTypes,
  getUserTickets,
  createTicket,
};

export default ticketsService;
