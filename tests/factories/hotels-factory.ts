import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.city(),
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      hotelId,
      name: `Room ${faker.random.alphaNumeric(5)}`,
      capacity: faker.datatype.number({ min: 1, max: 10 }),
    },
  });
}
