import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking, getBooking } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('*/', authenticateToken)
  .post('/', createBooking)
  .get('/', getBooking)
  .put('/:bookingId', (req, res) => {
    res.send('PUT /booking/:bookingId');
  });

export { bookingsRouter };
