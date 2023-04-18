import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { notFoundError } from '@/errors';
import { Payment } from '@/protocols';

async function findPayment(ticketId: number): Promise<Payment> {
  const payment = await prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
  if (!payment) throw notFoundError();

  const returnObject: Payment = {
    id: payment.id,
    ticketId: payment.ticketId,
    value: payment.value,
    cardIssuer: payment.cardIssuer, //VISA | MASTERCARD
    cardLastDigits: payment.cardLastDigits,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };

  return returnObject;
}

async function checkOwnerTicket(ticketId: number) {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      TicketType: true,
      Enrollment: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });
}

async function createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
  const { ticketId, value, cardIssuer, cardLastDigits } = payment;

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.PAID },
    });

    return await prisma.payment.create({
      data: {
        ticketId,
        value,
        cardIssuer,
        cardLastDigits,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

const paymentsRepository = {
  findPayment,
  checkOwnerTicket,
  createPayment,
};

export default paymentsRepository;
