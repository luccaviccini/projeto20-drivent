import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { Payment } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const ticketId = req.query.ticketId as string;
  if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.getPayment(Number(ticketId));
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    else if (error.name === 'UnauthorizedError') return res.status(httpStatus.UNAUTHORIZED).send(error.message);
    return res.status(httpStatus.BAD_REQUEST).send(error.message);
  }
}

export async function postPaymentsProcess(req: AuthenticatedRequest, res: Response) {
  try {
    return res.status(httpStatus.OK).send();
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
