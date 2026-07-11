import { NotFoundException } from '@nestjs/common';
import { PackageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PackagesService } from './packages.service';

function createSubject() {
  const findFirst = jest.fn();
  const findMany = jest.fn();
  const prisma = {
    tutoringPackage: { findFirst, findMany },
  } as unknown as PrismaService;
  return { service: new PackagesService(prisma), findFirst, findMany };
}

describe('PackagesService public detail', () => {
  it('queries only published packages and published related items', async () => {
    const subject = createSubject();
    const pack = {
      id: 'pack-id',
      slug: 'backend-mentor',
      category: 'BACKEND',
      price: { toString: () => '2000000' },
    };
    subject.findFirst.mockResolvedValue(pack);
    subject.findMany.mockResolvedValue([]);

    await expect(subject.service.detail(pack.slug)).resolves.toEqual({
      ...pack,
      price: '2000000',
      related: [],
    });

    expect(subject.findFirst).toHaveBeenCalledWith({
      where: { slug: pack.slug, status: PackageStatus.PUBLISHED },
    });
    expect(subject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: PackageStatus.PUBLISHED }),
      }),
    );
  });

  it('returns the same not-found result when no published package matches', async () => {
    const subject = createSubject();
    subject.findFirst.mockResolvedValue(null);

    await expect(subject.service.detail('draft-or-missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(subject.findMany).not.toHaveBeenCalled();
  });
});
