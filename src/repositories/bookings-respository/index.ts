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

export const bookingsRepository = {
  createBooking,
};
