import { Booking } from '.prisma/client';
import { notFoundError, forbiddenError } from '@/errors';
import { bookingsRepository } from '@/repositories/booking-respository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function verifyEnrollmentAndPaidTicket(userId: number): Promise<void> {
  const enrollment = await enrollmentRepository.findEnrollment(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.getUserTickets(enrollment.id);
  if (!ticket) throw notFoundError();

  if (!ticket.TicketType.includesHotel || ticket.status !== 'PAID' || ticket.TicketType.isRemote)
    throw forbiddenError();

  return;
}

async function createBooking(userId: number, roomId: number): Promise<Booking> {
  await verifyEnrollmentAndPaidTicket(userId);

  const room = await hotelsRepository.getRoomWithBookings(roomId);
  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw forbiddenError();

  const booking = await bookingsRepository.createBooking(userId, roomId);

  return booking;
}

async function getBooking(userId: number) {
  await verifyEnrollmentAndPaidTicket(userId);

  const booking = await bookingsRepository.getBooking(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number): Promise<Booking> {
  await verifyEnrollmentAndPaidTicket(userId);

  const room = await hotelsRepository.getRoomWithBookings(roomId);
  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw forbiddenError();

  const booking = await bookingsRepository.getBookingByUser(userId, bookingId);
  if (!booking) throw forbiddenError();

  return await bookingsRepository.updateBooking(userId, bookingId, roomId);
}

export const bookingsService = {
  createBooking,
  getBooking,
  updateBooking,
};
