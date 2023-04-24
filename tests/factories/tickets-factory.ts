import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createPaidTicketType() {
  return prisma.ticketType.create({
    data: {
      name: `Paid Ticket - ${faker.commerce.productAdjective()} ${faker.commerce.department()}`,
      price: faker.datatype.number({ min: 50, max: 5000 }),
      isRemote: false,
      includesHotel: true,
    },
  });
}
