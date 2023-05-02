import httpStatus from 'http-status';
import supertest from 'supertest';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createHotel,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createRoomWithLimit,
  createTicket,
  createTicketType,
  createUser,
  createRemoteTicketType,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createBooking } from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

async function testUnauthorizedRequest(route: string, method: 'get' | 'post' | 'put', token?: string) {
  const request = server[method](route);

  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }

  const response = await request;

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
}

async function invalidTokenVerification(route: string, method: 'get' | 'post' | 'put') {
  it('should respond with status 401 if no token is given', async () => {
    await testUnauthorizedRequest(route, method);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    await testUnauthorizedRequest(route, method, token);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    await testUnauthorizedRequest(route, method, token);
  });
}

async function generateUserWithToken() {
  const user = await createUser();
  const token = await generateValidToken(user);

  return { user, token };
}

async function generateUserWithTicket() {
  const { user, token } = await generateUserWithToken();
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

  return { user, token, enrollment, ticketType, ticket };
}

async function createHotelAndRoom() {
  const hotel = await createHotel();
  const room = await createRoomWithLimit(hotel.id, 1);

  return { hotel, room };
}

describe('POST /booking', () => {
  invalidTokenVerification('/booking', 'post');

  it('should respond with status 403 if ticket is remote', async () => {
    const { user, token } = await generateUserWithToken();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createRemoteTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket does not include hotel', async () => {
    const { user, token } = await generateUserWithToken();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithoutHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if user has not paid ticket', async () => {
    const { user, token } = await generateUserWithToken();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if room is at full capacity', async () => {
    const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
    const { hotel, room } = await createHotelAndRoom();
    await createBooking(user.id, room.id);

    const response = await server.post('/booking').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);
  });

  it('should respond with status 404 if cannot find roomId', async () => {
    const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
    const { hotel, room } = await createHotelAndRoom();

    const response = await server
      .put('/booking')
      .send({ roomId: room.id + 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 200 and with bookingId', async () => {
    const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
    const { hotel, room } = await createHotelAndRoom();

    const response = await server.post('/booking').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

    expect(response.body).toEqual({ bookingId: expect.any(Number) });
    expect(response.status).toBe(httpStatus.OK);
  });
});

describe('GET /booking', () => {
  invalidTokenVerification('/booking', 'get');

  describe('when token is valid', () => {
    it('should respond with status 404 if user does not have a booking', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with booking', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
      const { hotel, room } = await createHotelAndRoom();
      const newBooking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({
        id: newBooking.id,
        Room: { ...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString() },
      });
      expect(response.status).toBe(httpStatus.OK);
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  invalidTokenVerification('/booking/1', 'put');

  describe('when token is valid', () => {
    it('should respond with status 403 if cant find bookingId', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
      const { hotel, room } = await createHotelAndRoom();

      const response = await server.put('/booking/1').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if room is at full capacity', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
      const { hotel, room } = await createHotelAndRoom();
      await createBooking(user.id, room.id);

      const response = await server.put('/booking/1').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if cannot find roomId', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
      const { hotel, room } = await createHotelAndRoom();

      const response = await server
        .put('/booking/1')
        .send({ roomId: room.id + 1 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 if room is not at full capacity', async () => {
      const { user, token, enrollment, ticketType, ticket } = await generateUserWithTicket();
      const { hotel, room } = await createHotelAndRoom();
      const newBooking = await createBooking(user.id, room.id);
      const newRoom = await createRoomWithLimit(hotel.id, 1);

      const response = await server
        .put(`/booking/${newBooking.id}`)
        .send({ roomId: newRoom.id })
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({ bookingId: newBooking.id });
      expect(response.status).toBe(httpStatus.OK);
    });
  });
});
