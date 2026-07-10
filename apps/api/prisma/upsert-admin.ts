import * as argon2 from 'argon2';
import { AccountStatus, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'nguyenhuynhhoangkha@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME ?? 'Nguyễn Huỳnh Hoàng Kha';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing && !password) {
    throw new Error('ADMIN_PASSWORD is required when creating a new admin account.');
  }

  const passwordHash = password ? await argon2.hash(password) : undefined;

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      fullName,
      passwordHash: passwordHash!,
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      adminProfile: {
        create: {
          department: 'Owner',
          notes: 'Created by prisma/upsert-admin.ts',
        },
      },
    },
    update: {
      fullName,
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      ...(passwordHash ? { passwordHash } : {}),
      adminProfile: {
        upsert: {
          create: {
            department: 'Owner',
            notes: 'Created by prisma/upsert-admin.ts',
          },
          update: {
            department: 'Owner',
            notes: 'Updated by prisma/upsert-admin.ts',
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
    },
  });

  console.log(`Admin account ready: ${admin.email} (${admin.role}, ${admin.status})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
