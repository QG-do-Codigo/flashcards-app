import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { BatchCreateCardsDto } from './dto/batch-create-cards.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo card em um baralho
   */
  async create(deckId: string, createCardDto: CreateCardDto) {
    // Verifica se o baralho existe
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    // Verifica se já existe um card com a mesma frente neste baralho
    const existingCard = await this.prisma.card.findFirst({
      where: {
        deckId,
        front: createCardDto.front,
      },
    });

    if (existingCard) {
      throw new BadRequestException(
        'Já existe um card com esta frente neste baralho',
      );
    }

    return this.prisma.card.create({
      data: {
        ...createCardDto,
        deckId,
        // Valores padrão para o algoritmo SM-2
        difficulty: 3, // Dificuldade média inicial
        interval: 1, // Intervalo inicial de 1 dia (aplicado após a primeira revisão)
        easeFactor: 2.5, // Fator de facilidade padrão
        nextReview: new Date(), // Card novo já disponível para estudo
      },
    });
  }

  /**
   * Cria múltiplos cards de uma vez
   */
  async batchCreate(deckId: string, batchCreateCardsDto: BatchCreateCardsDto) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    // Prepara os dados para criação em batch
    const cardsData = batchCreateCardsDto.cards.map((card) => ({
      ...card,
      deckId,
      difficulty: 3,
      interval: 1,
      easeFactor: 2.5,
      nextReview: new Date(),
    }));

    // Cria todos os cards
    await this.prisma.card.createMany({
      data: cardsData,
    });

    // Retorna os cards criados
    return this.prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
      take: cardsData.length,
    });
  }

  /**
   * Lista todos os cards de um baralho
   */
  async findAll(deckId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    return this.prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtém cards que estão para revisão hoje
   */
  async findDueCards(deckId: string, userId: string, limit: number = 20) {
    // Verifica se o usuário é dono do baralho
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    const now = new Date();

    return this.prisma.card.findMany({
      where: {
        deckId,
        nextReview: {
          lte: now, // nextReview <= agora
        },
      },
      take: limit,
      orderBy: {
        nextReview: 'asc', // Cards mais atrasados primeiro
      },
    });
  }

  /**
   * Obtém um card específico
   */
  async findOne(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return card;
  }

  /**
   * Atualiza um card
   */
  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return this.prisma.card.update({
      where: { id },
      data: updateCardDto,
    });
  }

  /**
   * Remove um card
   */
  async remove(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return this.prisma.card.delete({
      where: { id },
    });
  }

  /**
   * ALGORITMO SM-2 - Revisão espaçada
   * Baseado no algoritmo SuperMemo 2
   */
  async reviewCard(
    userId: string,
    cardId: string,
    reviewCardDto: ReviewCardDto,
  ) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    // Verifica se o usuário é dono do card
    if (card.deck.userId !== userId) {
      throw new NotFoundException('Card não encontrado');
    }

    const { difficulty } = reviewCardDto;

    // Implementação do algoritmo SM-2
    let newInterval: number;
    let newEaseFactor = card.easeFactor;
    const reviewCount = card.reviewCount + 1;

    if (difficulty >= 3) {
      // Resposta boa ou fácil
      if (card.interval === 0) {
        newInterval = 1; // Primeira revisão: 1 dia
      } else if (card.interval === 1) {
        newInterval = 6; // Segunda revisão: 6 dias
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }

      // Ajusta o fator de facilidade
      // Fórmula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      // Simplificada para nosso caso:
      const adjustment = 0.1 - (5 - difficulty) * 0.08;
      newEaseFactor = Math.max(1.3, card.easeFactor + adjustment);
    } else {
      // Resposta difícil
      newInterval = 1; // Reinicia para 1 dia
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
    }

    // Calcula a próxima data de revisão
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    // Atualiza o card com os novos valores
    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        difficulty,
        interval: newInterval,
        easeFactor: newEaseFactor,
        nextReview,
        reviewCount,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Obtém estatísticas dos cards de um baralho
   */
  async getDeckCardsStats(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    const cards = await this.prisma.card.findMany({
      where: { deckId },
      select: {
        difficulty: true,
        nextReview: true,
        reviewCount: true,
        createdAt: true,
      },
    });

    const now = new Date();

    // Cards para revisão hoje
    const dueCards = cards.filter(
      (card) => new Date(card.nextReview) <= now,
    ).length;

    // Cards novos (nunca revisados)
    const newCards = cards.filter((card) => card.reviewCount === 0).length;

    // Cards aprendidos (revisados pelo menos uma vez)
    const learnedCards = cards.filter((card) => card.reviewCount > 0).length;

    // Média de dificuldade
    const averageDifficulty =
      cards.length > 0
        ? cards.reduce((sum, card) => sum + card.difficulty, 0) / cards.length
        : 0;

    // Cards por nível de dificuldade
    const difficultyDistribution = {
      veryHard: cards.filter((c) => c.difficulty === 1).length,
      hard: cards.filter((c) => c.difficulty === 2).length,
      medium: cards.filter((c) => c.difficulty === 3).length,
      easy: cards.filter((c) => c.difficulty === 4).length,
      veryEasy: cards.filter((c) => c.difficulty === 5).length,
    };

    // Próximos reviews agendados
    const upcomingReviews = cards
      .filter((card) => new Date(card.nextReview) > now)
      .sort(
        (a, b) =>
          new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime(),
      )
      .slice(0, 5)
      .map((card) => ({
        nextReview: card.nextReview,
        reviewCount: card.reviewCount,
      }));

    return {
      totalCards: cards.length,
      dueCards,
      newCards,
      learnedCards,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      difficultyDistribution,
      upcomingReviews,
    };
  }

  /**
   * Busca cards por termo (para busca no frontend)
   */
  async searchCards(deckId: string, userId: string, query: string) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      throw new NotFoundException('Baralho não encontrado');
    }

    return this.prisma.card.findMany({
      where: {
        deckId,
        OR: [
          { front: { contains: query, mode: 'insensitive' } },
          { back: { contains: query, mode: 'insensitive' } },
          { example: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
