import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getPayments, paymentsProcess } from '@/controllers/payments-controller';

const paymentsRouter = Router();

paymentsRouter.all('/*', authenticateToken).get('/', getPayments).post('/process', paymentsProcess);

export { paymentsRouter };
