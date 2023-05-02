import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('*/', authenticateToken)
  .post('/', createBooking)
  .get('/', (req, res) => {
    res.send('GET /booking');
  })
  .put('/:bookingId', (req, res) => {
    res.send('PUT /booking/:bookingId');
  });

export { bookingsRouter };
