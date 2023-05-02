import { Booking, Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

async function getAllHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function getHotelRoomsById(hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  return await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function getRoomWithBookings(roomId: number): Promise<Room & { Booking: Booking[] }> {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  });
}

const hotelsRepository = {
  getAllHotels,
  getHotelRoomsById,
  getRoomWithBookings,
};

export default hotelsRepository;
