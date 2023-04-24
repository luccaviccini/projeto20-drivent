import { Router } from 'express';
import { authenticateToken, validateParams } from '@/middlewares';
import { getAllHotels, getHotelRoomsById } from '@/controllers/hotels-controller';
import { HotelIdParamsSchema } from '@/schemas/hotels-schemas';

const hotelsRouter = Router();

hotelsRouter
  .all('*/', authenticateToken)
  .get('/', getAllHotels)
  .get('/:id', validateParams(HotelIdParamsSchema), getHotelRoomsById);

export { hotelsRouter };
