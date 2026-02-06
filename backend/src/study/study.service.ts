import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class StudyService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, createSessionDto: CreateSessionDto) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: createSessionDto.deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    return this.prisma.studySession.create({
      data: {
        userId,
        deckId: createSessionDto.deckId,
        cardsReviewed: 0,
        correctAnswers: 0,
        duration: 0,
        completed: false,
      },
    });
  }

  async findOne(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  async findAll(userId: string, deckId?: string, limit: number = 20) {
    const whereClause: any = { userId };

    if (deckId) {
      whereClause.deckId = deckId;
    }

    return this.prisma.studySession.findMany({
      where: whereClause,
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async updateSession(
    userId: string,
    sessionId: string,
    updateSessionDto: UpdateSessionDto,
  ) {
    const session = await this.prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: updateSessionDto,
    });
  }

  async remove(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return this.prisma.studySession.delete({
      where: { id: sessionId },
    });
  }
}
