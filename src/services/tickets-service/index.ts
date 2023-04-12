import { notFoundError } from '@/errors';
import { TicketType, Ticket } from '@/protocols';
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

const ticketsService = {
  getTicketTypes,
  getUserTickets,
};

export default ticketsService;
