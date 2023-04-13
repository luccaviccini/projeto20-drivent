import { Enrollment } from '@prisma/client';
import { prisma } from '@/config';

async function findEnrollment(userId: number): Promise<Enrollment> {
  const enrollment = prisma.enrollment.findUnique({
    where: {
      userId,
    },
  });

  return enrollment;
}

async function findWithAddressByUserId(userId: number) {
  console.log('ENTREI NO findWithAddressByUserId');
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, 'userId'>;

const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  findEnrollment,
};

export default enrollmentRepository;
