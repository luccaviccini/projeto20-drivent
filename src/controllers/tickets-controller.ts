import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketsService from '@/services/tickets-service';
import { Ticket } from '@/protocols';

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketTypes = await ticketsService.getTicketTypes();

    return res.status(httpStatus.OK).send(ticketTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getUserTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const userTickets = await ticketsService.getUserTickets(userId);
    return res.status(httpStatus.OK).send(userTickets);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body as Pick<Ticket, 'ticketTypeId'>;
  const { userId } = req;

  try {
    const ticket = await ticketsService.createTicket(userId, ticketTypeId);
    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    console.log(error);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
