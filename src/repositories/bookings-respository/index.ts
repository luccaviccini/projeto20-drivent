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

export const bookingsRepository = {
  createBooking,
  getBooking,
};
