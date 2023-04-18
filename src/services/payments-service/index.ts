import { invalidDataError, notFoundError, unauthorizedError } from '@/errors';
import { Payment, PaymentsProcessType, Ticket, CardData } from '@/protocols';
import paymentsRepository from '@/repositories/payments-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function findTicketAndValidate(ticketId: number, userId: number) {
  const ticket = await ticketsRepository.getTicketbyId(ticketId);
  if (!ticket) throw notFoundError();

  const { Enrollment } = await paymentsRepository.checkOwnerTicket(ticketId);

  const checkOwner = Enrollment.userId === userId;
  if (!checkOwner) throw unauthorizedError();

  return ticket;
}

async function getPayment(ticketId: number, userId: number): Promise<Payment> {
  await findTicketAndValidate(ticketId, userId);
  const payment = await paymentsRepository.findPayment(ticketId);
  if (!payment) throw notFoundError();
  return payment;
}

async function validateInputs(ticketId: number, cardData: CardData): Promise<void> {
  if (!ticketId || !cardData) {
    throw invalidDataError(['ticket Id and card Data must be provided']);
  }
}

async function buildPaymentObject(
  ticket: Ticket,
  cardData: CardData,
): Promise<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>> {
  return {
    ticketId: ticket.id,
    value: ticket.TicketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toLocaleString().slice(-4),
  };
}

async function paymentsProcess({ ticketId, cardData, userId }: PaymentsProcessType) {
  await validateInputs(ticketId, cardData);
  const ticket = await findTicketAndValidate(ticketId, userId);
  const payment = await buildPaymentObject(ticket, cardData);
  const newPayment = await paymentsRepository.createPayment(payment);

  return newPayment;
}

const paymentsService = {
  getPayment,
  paymentsProcess,
};

export default paymentsService;
