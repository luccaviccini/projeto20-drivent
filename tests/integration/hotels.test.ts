import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createPaidTicketType,
  createTicket,
  createHotel,
  createRoom,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

//helper functions
const createUserWithToken = async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  return { user, token };
};

const expectUnauthorizedResponse = async (url: string, token: string) => {
  const response = await server.get(url).set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
};

const expectNotFoundResponse = async (url: string, token: string) => {
  const response = await server.get(url).set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(httpStatus.NOT_FOUND);
};

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    expectUnauthorizedResponse('/hotels', token);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    expectUnauthorizedResponse('/hotels', token);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when enrollment does not exist', async () => {
      const { token } = await createUserWithToken();

      expectNotFoundResponse('/hotels', token);
    });

    it('should respond with status 404 when ticket does not exist', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollmentWithAddress(user);

      expectNotFoundResponse('/hotels', token);
    });

    it('should respond with status 404 when hotel does not exist', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createPaidTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      expectNotFoundResponse('/hotels', token);
    });

    it('should respond with status 402 when ticket has not been paid', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and with hotels data', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createPaidTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    expectUnauthorizedResponse('/hotels/1', token);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    expectUnauthorizedResponse('/hotels/1', token);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when enrollment does not exist', async () => {
      const { token } = await createUserWithToken();

      expectNotFoundResponse('/hotels/1', token);
    });

    it('should respond with status 404 when ticket does not exist', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollmentWithAddress(user);

      expectNotFoundResponse('/hotels/1', token);
    });

    it('should respond with status 404 when hotel does not exist', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createPaidTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      expectNotFoundResponse('/hotels/1', token);
    });

    it('should respond with status 402 when ticket has not been paid', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and with rooms data', async () => {
      const { user, token } = await createUserWithToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createPaidTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      });
    });
  });
});
