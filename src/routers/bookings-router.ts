import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking, getBooking, updateBooking } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('*/', authenticateToken)
  .post('/', createBooking)
  .get('/', getBooking)
  .put('/:bookingId', updateBooking);

export { bookingsRouter };
