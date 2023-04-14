import { notFoundError } from '@/errors';
import { Payment } from '@/protocols';
import paymentsRepository from '@/repositories/payments-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getPayment(ticketId: number): Promise<Payment> {
  const ticket = await ticketsRepository.getTicketbyId(ticketId);
  console.log('TICKET');
  console.log(ticket);
  if (!ticket) throw notFoundError();

  const payment = await paymentsRepository.findPayment(ticketId);
  if (!payment) throw notFoundError();
  return payment;
}

const paymentsService = {
  getPayment,
};

export default paymentsService;
