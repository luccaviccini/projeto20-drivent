import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getAllHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId }: { userId: number } = req;
  try {
    const hotels = await hotelsService.getAllHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    next(error);
  }
}

export async function getHotelRoomsById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId }: { userId: number } = req;
  const { id: hotelId } = req.params as { id: string };

  try {
    const hotelRooms = await hotelsService.getHotelRoomsById(userId, Number(hotelId));
    return res.status(httpStatus.OK).send(hotelRooms);
  } catch (error) {
    next(error);
  }
}
