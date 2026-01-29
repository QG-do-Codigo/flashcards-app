import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DeckStats } from './types/deck-stats.type';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDeckDto: CreateDeckDto) {
    const deck = await this.prisma.deck.create({
      data: {
        ...createDeckDto,
        userId,
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    // Check for badge achievement - FIRST_DECK
    const deckCount = await this.prisma.deck.count({
      where: { userId },
    });

    if (deckCount === 1) {
      try {
        await this.prisma.badge.create({
          data: {
            userId,
            type: 'FIRST_DECK',
            title: 'First Deck',
            description: 'Created your first deck',
            icon: '🎯',
          },
        });
      } catch (error) {
        // Silently fail if badge already exists
        console.log('Badge creation failed:', error);
      }
    }

    return deck;
  }

  async findAll(userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { userId },
      include: {
        _count: {
          select: { cards: true },
        },
        studySessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            cardsReviewed: true,
            correctAnswers: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Adiciona estatísticas calculadas
    const decksWithStats = await Promise.all(
      decks.map(async (deck) => {
        const dueCards = await this.prisma.card.count({
          where: {
            deckId: deck.id,
            nextReview: {
              lte: new Date(),
            },
          },
        });

        return {
          ...deck,
          dueCards,
        };
      }),
    );

    return decksWithStats;
  }

  async findOne(userId: string, id: string) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        cards: {
          orderBy: { nextReview: 'asc' },
        },
        _count: {
          select: { cards: true },
        },
        studySessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            cardsReviewed: true,
            correctAnswers: true,
            duration: true,
            completed: true,
            createdAt: true,
          },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // Calcula cartas para revisar
    const dueCards = await this.prisma.card.count({
      where: {
        deckId: deck.id,
        nextReview: {
          lte: new Date(),
        },
      },
    });

    return {
      ...deck,
      dueCards,
    };
  }

  async update(userId: string, id: string, updateDeckDto: UpdateDeckDto) {
    // Verifica se o deck existe e pertence ao usuário
    const deck = await this.prisma.deck.findFirst({
      where: { id, userId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    return this.prisma.deck.update({
      where: { id },
      data: updateDeckDto,
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verifica se o deck existe e pertence ao usuário
    const deck = await this.prisma.deck.findFirst({
      where: { id, userId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // Usa transaction para deletar tudo relacionado ao deck
    return this.prisma.$transaction(async (prisma) => {
      // Primeiro deleta os cards
      await prisma.card.deleteMany({
        where: { deckId: id },
      });

      // Deleta as sessões de estudo
      await prisma.studySession.deleteMany({
        where: { deckId: id },
      });

      // Finalmente deleta o deck
      return prisma.deck.delete({
        where: { id },
      });
    });
  }

  async getDeckStats(userId: string, deckId: string): Promise<DeckStats> {
    // Verifica se o deck pertence ao usuário
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const [cards, sessions, todaySession] = await Promise.all([
      this.prisma.card.findMany({
        where: { deckId },
        select: {
          difficulty: true,
          nextReview: true,
        },
      }),
      this.prisma.studySession.findMany({
        where: { deckId, userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.studySession.findFirst({
        where: {
          deckId,
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    const totalCards = cards.length;
    const dueCards = cards.filter(
      (card) => new Date(card.nextReview) <= new Date(),
    ).length;

    const averageDifficulty =
      totalCards > 0
        ? cards.reduce((acc, card) => acc + card.difficulty, 0) / totalCards
        : 0;

    return {
      totalCards,
      dueCards,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      sessions: sessions.length,
      todaySession: todaySession
        ? {
            cardsReviewed: todaySession.cardsReviewed,
            correctAnswers: todaySession.correctAnswers,
          }
        : undefined,
    };
  }

  async searchDecks(userId: string, query: string) {
    return this.prisma.deck.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDueCardsCount(userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { userId },
      select: { id: true },
    });

    const deckIds = decks.map((deck) => deck.id);

    if (deckIds.length === 0) {
      return { totalDueCards: 0, deckCounts: {} };
    }

    const dueCards = await this.prisma.card.groupBy({
      by: ['deckId'],
      where: {
        deckId: { in: deckIds },
        nextReview: { lte: new Date() },
      },
      _count: {
        id: true,
      },
    });

    const deckCounts = dueCards.reduce((acc, item) => {
      acc[item.deckId] = item._count.id;
      return acc;
    }, {});

    const totalDueCards = dueCards.reduce(
      (sum, item) => sum + item._count.id,
      0,
    );

    return { totalDueCards, deckCounts };
  }
}
