import { Booking } from '.prisma/client';
import { notFoundError, forbiddenError } from '@/errors';
import { bookingsRepository } from '@/repositories/bookings-respository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function verifyEnrollmentAndPaidTicket(userId: number) {
  const enrollment = await enrollmentRepository.findEnrollment(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.getUserTickets(enrollment.id);
  if (!ticket) throw notFoundError();

  if (!ticket.TicketType.includesHotel || ticket.status !== 'PAID' || ticket.TicketType.isRemote)
    throw forbiddenError();

  return;
}

async function createBooking(userId: number, roomId: number) {
  await verifyEnrollmentAndPaidTicket(userId);

  const room = await hotelsRepository.getRoomWithBookings(roomId);
  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw forbiddenError();

  const booking = await bookingsRepository.createBooking(userId, roomId);

  return booking;
}

export const bookingsService = {
  createBooking,
};
