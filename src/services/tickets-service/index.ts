import { notFoundError } from '@/errors';
import { TicketType, Ticket } from '@/protocols';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { request } from '@/utils/request';

async function getTicketTypes(): Promise<TicketType[]> {
  const result = await ticketsRepository.getTicketTypes();
  if (!result) throw notFoundError();

  return result;
}

async function getUserTickets(userId: number): Promise<Ticket> {
  const result = await ticketsRepository.getUserTickets(userId);
  if (!result) throw notFoundError();

  return result;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  console.log('ENTREI NO SERVICE');
  const query = await enrollmentRepository.findEnrollment(userId);
  console.log(query);
  console.log('SAI DO REPOSITORY');

  if (!query) throw notFoundError();
  console.log('Ele passa do if?');
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
