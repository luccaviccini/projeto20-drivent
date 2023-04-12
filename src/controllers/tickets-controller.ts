import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketsService from '@/services/tickets-service';

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
