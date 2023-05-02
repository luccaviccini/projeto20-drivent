import { Booking, Room } from '@prisma/client';
import { prisma } from '@/config';

async function createBooking(userId: number, roomId: number): Promise<Booking> {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function getBooking(userId: number): Promise<Booking & { Room: Room }> {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

async function getBookingByUser(userId: number, bookingId: number): Promise<Booking> {
  return await prisma.booking.findFirst({
    where: {
      userId,
      id: bookingId,
    },
  });
}

async function updateBooking(userId: number, bookingId: number, roomId: number): Promise<Booking> {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      userId,
      roomId,
    },
  });
}

export const bookingsRepository = {
  createBooking,
  getBooking,
  getBookingByUser,
  updateBooking,
};
