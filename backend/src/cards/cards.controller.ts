/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { BatchCreateCardsDto } from './dto/batch-create-cards.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Card } from './entities/card.entity';

// Criando a entidade Card para Swagger (se ainda não existir)
export class CardEntity implements Card {
  id: string;
  front: string;
  back: string;
  example?: string;
  audioUrl?: string;
  deckId: string;
  difficulty: number;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Swagger
export class ReviewCardResponseDto {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  reviewCount: number;
}

export class CardsStatsResponseDto {
  totalCards: number;
  dueCards: number;
  newCards: number;
  learnedCards: number;
  averageDifficulty: number;
  difficultyDistribution: {
    veryHard: number;
    hard: number;
    medium: number;
    easy: number;
    veryEasy: number;
  };
  upcomingReviews: Array<{
    nextReview: Date;
    reviewCount: number;
  }>;
}

@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('deck/:deckId')
  @ApiOperation({
    summary: 'Criar um novo card',
    description:
      'Cria um novo card em um baralho específico. O card será configurado com valores padrão para o algoritmo SM-2.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho onde o card será criado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CreateCardDto,
    description: 'Dados do card a ser criado',
    examples: {
      basic: {
        summary: 'Card básico',
        value: {
          front: 'Be (ser/estar)',
          back: 'was/were - been',
        },
      },
      withExample: {
        summary: 'Card com exemplo',
        value: {
          front: 'Have (ter)',
          back: 'had - had',
          example: 'I have had this car for years',
        },
      },
      withAudio: {
        summary: 'Card com áudio',
        value: {
          front: 'Apple',
          back: 'Maçã',
          example: 'I eat an apple every day',
          audioUrl: 'https://example.com/audio/apple.mp3',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Card criado com sucesso',
    type: CardEntity,
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Já existe um card com esta frente neste baralho',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  create(
    @Param('deckId') deckId: string,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardsService.create(deckId, createCardDto);
  }

  @Post('deck/:deckId/batch')
  @ApiOperation({
    summary: 'Criar múltiplos cards de uma vez',
    description:
      'Cria vários cards em um baralho em uma única requisição. Útil para importação de dados.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho onde os cards serão criados',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: BatchCreateCardsDto,
    description: 'Lista de cards a serem criados',
    examples: {
      verbs: {
        summary: 'Cards de verbos irregulares',
        value: {
          cards: [
            {
              front: 'Be',
              back: 'was/were - been',
              example: 'I was happy yesterday',
            },
            {
              front: 'Have',
              back: 'had - had',
              example: 'She has had that car for years',
            },
            {
              front: 'Do',
              back: 'did - done',
              example: 'Have you done your homework?',
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cards criados com sucesso',
    type: [CardEntity],
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  batchCreate(
    @Param('deckId') deckId: string,
    @Body() batchCreateCardsDto: BatchCreateCardsDto,
  ) {
    return this.cardsService.batchCreate(deckId, batchCreateCardsDto);
  }

  @Get('deck/:deckId')
  @ApiOperation({
    summary: 'Listar todos os cards de um baralho',
    description:
      'Retorna todos os cards de um baralho específico, ordenados pela data de criação (mais recentes primeiro).',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lista de cards do baralho',
    type: [CardEntity],
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  findAll(@Param('deckId') deckId: string) {
    return this.cardsService.findAll(deckId);
  }

  @Get('deck/:deckId/due')
  @ApiOperation({
    summary: 'Obter cards para revisão hoje',
    description:
      'Retorna os cards que estão vencidos para revisão (próxima revisão <= data atual). Ordenados pelos mais atrasados primeiro.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de cards a retornar (padrão: 20)',
    example: 10,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Cards para revisão hoje',
    type: [CardEntity],
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado ou usuário não tem permissão',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  findDueCards(
    @Param('deckId') deckId: string,
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.cardsService.findDueCards(deckId, req.user.id, limit);
  }

  @Get('deck/:deckId/stats')
  @ApiOperation({
    summary: 'Obter estatísticas dos cards de um baralho',
    description:
      'Retorna estatísticas detalhadas sobre os cards de um baralho, incluindo distribuição de dificuldade e cards para revisão.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Estatísticas dos cards',
    type: CardsStatsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado ou usuário não tem permissão',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  getDeckCardsStats(@Param('deckId') deckId: string, @Request() req) {
    return this.cardsService.getDeckCardsStats(deckId, req.user.id);
  }

  @Get('deck/:deckId/search')
  @ApiOperation({
    summary: 'Buscar cards por termo',
    description:
      'Busca cards dentro de um baralho que contenham o termo especificado na frente, verso ou exemplo.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID do baralho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Termo de busca',
    example: 'happy',
  })
  @ApiOkResponse({
    description: 'Cards encontrados na busca',
    type: [CardEntity],
  })
  @ApiNotFoundResponse({
    description: 'Baralho não encontrado ou usuário não tem permissão',
  })
  @ApiBadRequestResponse({
    description: 'Termo de busca não fornecido',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  searchCards(
    @Param('deckId') deckId: string,
    @Request() req,
    @Query('q') query: string,
  ) {
    return this.cardsService.searchCards(deckId, req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter um card específico',
    description: 'Retorna os detalhes de um card específico pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do card',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Detalhes do card',
    type: CardEntity,
  })
  @ApiNotFoundResponse({
    description: 'Card não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um card',
    description: 'Atualiza os dados de um card existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do card a ser atualizado',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateCardDto,
    description: 'Dados do card a serem atualizados',
    examples: {
      updateFront: {
        summary: 'Atualizar apenas a frente',
        value: {
          front: 'To be (updated)',
        },
      },
      updateAll: {
        summary: 'Atualizar múltiplos campos',
        value: {
          front: 'To be',
          back: 'was/were - been',
          example: 'I was very happy yesterday',
          audioUrl: 'https://example.com/audio/to-be.mp3',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Card atualizado com sucesso',
    type: CardEntity,
  })
  @ApiNotFoundResponse({
    description: 'Card não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover um card',
    description: 'Remove permanentemente um card do sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do card a ser removido',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Card removido com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Card não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }

  @Post(':id/review')
  @ApiOperation({
    summary: 'Revisar um card (algoritmo SM-2)',
    description:
      'Registra a revisão de um card utilizando o algoritmo SM-2 de repetição espaçada. A dificuldade informada determina quando o card será revisado novamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do card a ser revisado',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: ReviewCardDto,
    description: 'Dificuldade da revisão (1-5)',
    examples: {
      difficult: {
        summary: 'Difícil (revisar amanhã)',
        value: {
          difficulty: 1,
        },
      },
      good: {
        summary: 'Bom (revisar em alguns dias)',
        value: {
          difficulty: 3,
        },
      },
      easy: {
        summary: 'Fácil (revisar em 1+ semana)',
        value: {
          difficulty: 5,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Card revisado com sucesso',
    type: ReviewCardResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Card não encontrado ou usuário não tem permissão',
  })
  @ApiBadRequestResponse({
    description: 'Dificuldade fora do intervalo 1-5',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
  reviewCard(
    @Param('id') cardId: string,
    @Request() req,
    @Body() reviewCardDto: ReviewCardDto,
  ) {
    return this.cardsService.reviewCard(req.user.id, cardId, reviewCardDto);
  }
}
