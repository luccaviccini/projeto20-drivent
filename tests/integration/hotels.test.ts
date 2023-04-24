import faker from '@faker-js/faker';
import { TicketStatus, User } from '@prisma/client';
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

const createEnrollment = async (user: User, paidTicket = true) => {
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = paidTicket ? await createPaidTicketType() : await createTicketType();
  const ticketStatus = paidTicket ? TicketStatus.PAID : TicketStatus.RESERVED;
  await createTicket(enrollment.id, ticketType.id, ticketStatus);
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
      await createEnrollment(user, true);

      expectNotFoundResponse('/hotels', token);
    });

    it('should respond with status 402 when ticket has not been paid', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollment(user, false);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 with hotels data', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollment(user, true);
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
      await createEnrollment(user, true);

      expectNotFoundResponse('/hotels/1', token);
    });

    it('should respond with status 402 when ticket has not been paid', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollment(user, false);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 with rooms data', async () => {
      const { user, token } = await createUserWithToken();
      await createEnrollment(user, true);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: expect.arrayContaining([
          expect.objectContaining({
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          }),
        ]),
      });
    });
  });
});
