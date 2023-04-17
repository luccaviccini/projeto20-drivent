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
          userId: true,
        },
      },
    },
  });
}

const paymentsRepository = {
  findPayment,
  checkOwnerTicket,
};

export default paymentsRepository;
