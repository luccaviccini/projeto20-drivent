import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { Payment } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const ticketId = req.query.ticketId as string;
  const { userId }: { userId: number } = req;
  if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.getPayment(Number(ticketId), userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    // Handle different types of errors and send the appropriate response.
    switch (error.name) {
      case 'NotFoundError':
        return res.status(httpStatus.NOT_FOUND).send(error.message);
      case 'UnauthorizedError':
        return res.status(httpStatus.UNAUTHORIZED).send(error.message);
      default:
        return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
  }
}

export async function postPaymentsProcess(req: AuthenticatedRequest, res: Response) {
  try {
    return res.status(httpStatus.OK).send();
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
