import { notFoundError, unauthorizedError } from '@/errors';
import { Payment } from '@/protocols';
import paymentsRepository from '@/repositories/payments-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getPayment(ticketId: number, userId: number): Promise<Payment> {
  const ticket = await ticketsRepository.getTicketbyId(ticketId);
  console.log('TICKET:');
  console.log(ticket);
  if (!ticket) throw notFoundError();

  const { Enrollment } = await paymentsRepository.checkOwnerTicket(ticketId);
  console.log('ENROLLMENT:');
  console.log(Enrollment);
  const checkOwner = Enrollment.userId === userId;

  if (!checkOwner) throw unauthorizedError();

  const payment = await paymentsRepository.findPayment(ticketId);

  if (!payment) throw notFoundError();

  return payment;
}

const paymentsService = {
  getPayment,
};

export default paymentsService;
