import { notFoundError, paymentRequiredError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import hotelsRepository from '@/repositories/hotels-repository';

async function validateEnrollmentAndPayment(userId: number) {
  const enrollment = await enrollmentRepository.findEnrollment(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.getUserTickets(enrollment.id);
  if (!ticket) throw notFoundError();

  if (!ticket.TicketType.includesHotel || ticket.status !== 'PAID' || ticket.TicketType.isRemote)
    throw paymentRequiredError();

  return;
}

async function getAllHotels(userId: number) {
  await validateEnrollmentAndPayment(userId);

  const hotels = await hotelsRepository.getAllHotels();
  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelRoomsById(userId: number, hotelId: number) {
  await validateEnrollmentAndPayment(userId);

  const hotelRooms = await hotelsRepository.getHotelRoomsById(hotelId);
  if (!hotelRooms) throw notFoundError();

  return hotelRooms;
}

const hotelsService = {
  getAllHotels,
  getHotelRoomsById,
};

export default hotelsService;
