import { TicketType } from '@prisma/client';
import { Ticket } from '@/protocols';
import { prisma } from '@/config';

async function getTicketTypes(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

async function getUserTickets(userId: number): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: userId,
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
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    TicketType: {
      id: ticket.TicketType.id,
      name: ticket.TicketType.name,
      price: ticket.TicketType.price,
      isRemote: ticket.TicketType.isRemote,
      includesHotel: ticket.TicketType.includesHotel,
      createdAt: ticket.TicketType.createdAt,
      updatedAt: ticket.TicketType.updatedAt,
    },
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
  getUserTickets,
  createTicket,
};

export default ticketsRepository;
