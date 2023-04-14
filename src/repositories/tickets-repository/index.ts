import { TicketType } from '@prisma/client';
import { Ticket } from '@/protocols';
import { prisma } from '@/config';

async function getTicketTypes(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

async function getTicketbyId(ticketId: number) {
  const ticket = prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    return null;
  }

  return ticket;
}

async function getUserTickets(enrollmentId: number): Promise<Ticket> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });

  if (!ticket) {
    return null;
  }

  const result: Ticket = {
    id: ticket.id,
    status: ticket.status,
    ticketTypeId: ticket.ticketTypeId,
    enrollmentId: ticket.enrollmentId,
    TicketType: {
      id: ticket.TicketType.id,
      name: ticket.TicketType.name,
      price: ticket.TicketType.price,
      isRemote: ticket.TicketType.isRemote,
      includesHotel: ticket.TicketType.includesHotel,
      createdAt: ticket.TicketType.createdAt,
      updatedAt: ticket.TicketType.updatedAt,
    },
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };

  return result;
}

async function createTicket(enrollmentId: number, ticketTypeId: number): Promise<Ticket> {
  const ticket = await prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status: 'RESERVED',
    },
    include: {
      TicketType: true,
    },
  });

  if (!ticket) {
    return null;
  }

  const result: Ticket = {
    id: ticket.id,
    status: ticket.status,
    ticketTypeId: ticket.ticketTypeId,
    enrollmentId: ticket.enrollmentId,
    TicketType: {
      id: ticket.TicketType.id,
      name: ticket.TicketType.name,
      price: ticket.TicketType.price,
      isRemote: ticket.TicketType.isRemote,
      includesHotel: ticket.TicketType.includesHotel,
      createdAt: ticket.TicketType.createdAt,
      updatedAt: ticket.TicketType.updatedAt,
    },
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };

  return result;
}

const ticketsRepository = {
  getTicketTypes,
  getTicketbyId,
  getUserTickets,
  createTicket,
};

export default ticketsRepository;
