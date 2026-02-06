import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgeDto } from './dto/create-badge.dto';

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async createBadge(userId: string, createBadgeDto: CreateBadgeDto) {
    const existingBadge = await this.prisma.badge.findFirst({
      where: {
        userId,
        type: createBadgeDto.type,
      },
    });

    if (existingBadge) {
      return existingBadge;
    }

    return this.prisma.badge.create({
      data: {
        ...createBadgeDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }
}
