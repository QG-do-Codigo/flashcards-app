import { Injectable, NotFoundException } from '@nestjs/common';
import { BadgeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class StudyService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService,
  ) {}

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

    const updatedSession = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: updateSessionDto,
    });

    // Atualiza streak e badges se a sessão foi completada
    if (updateSessionDto.completed && !session.completed) {
      await this.updateUserStreak(userId);
      await this.checkSessionBadges(userId, updatedSession);
    }

    return updatedSession;
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

  private async updateUserStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudyDate = user.lastStudyDate
      ? new Date(user.lastStudyDate)
      : null;

    if (!lastStudyDate || lastStudyDate < today) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = 1;

      if (lastStudyDate && lastStudyDate.getTime() === yesterday.getTime()) {
        newStreak = user.streak + 1;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          lastStudyDate: new Date(),
        },
      });

      await this.checkStreakBadges(userId, newStreak);
    }
  }

  private async checkStreakBadges(userId: string, streak: number) {
    const badgesToCheck: { type: BadgeType; threshold: number; title: string; description: string; icon: string }[] = [
      { type: 'STREAK_7', threshold: 7, title: '7 Day Streak', description: 'Estudou por 7 dias consecutivos', icon: '🔥' },
      { type: 'STREAK_30', threshold: 30, title: '30 Day Streak', description: 'Estudou por 30 dias consecutivos', icon: '🌟' },
      { type: 'STREAK_100', threshold: 100, title: '100 Day Streak', description: 'Estudou por 100 dias consecutivos', icon: '💎' },
    ];

    for (const badge of badgesToCheck) {
      if (streak === badge.threshold) {
        await this.badgesService.createBadge(userId, {
          type: badge.type,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
        });
      }
    }
  }

  private async checkSessionBadges(userId: string, session: any) {
    const { cardsReviewed, correctAnswers } = session;

    // Badge: Sessão Perfeita
    if (cardsReviewed > 0 && correctAnswers === cardsReviewed) {
      await this.badgesService.createBadge(userId, {
        type: 'PERFECT_SESSION',
        title: 'Sessão Perfeita',
        description: 'Acertou todos os cards em uma sessão',
        icon: '🎯',
      });
    }

    // Badge: Aprendiz Rápido
    if (cardsReviewed >= 10 && (correctAnswers / cardsReviewed) >= 0.9) {
      await this.badgesService.createBadge(userId, {
        type: 'FAST_LEARNER',
        title: 'Aprendiz Rápido',
        description: 'Alta precisão em sessão com bom volume',
        icon: '⚡',
      });
    }

    // Badge: Maratona
    if (cardsReviewed >= 50) {
      await this.badgesService.createBadge(userId, {
        type: 'MARATHON',
        title: 'Maratona',
        description: 'Revisou 50+ cards em uma sessão',
        icon: '🏃‍♂️',
      });
    }
  }
}
