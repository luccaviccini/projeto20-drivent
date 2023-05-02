import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services/bookings-service';

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId }: { roomId: number } = req.body;

  try {
    const { id: bookingId } = await bookingsService.createBooking(userId, roomId);
    res.status(httpStatus.OK).send({ bookingId });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const { id, Room } = await bookingsService.getBooking(userId);
    return res.status(httpStatus.OK).send({ id, Room });
  } catch (err) {
    next(err);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId }: { roomId: number } = req.body;
  const { bookingId } = req.params as { bookingId: string };

  try {
    const { id } = await bookingsService.updateBooking(userId, Number(bookingId), roomId);
    res.status(httpStatus.OK).send({ bookingId: id });
  } catch (err) {
    next(err);
  }
}
