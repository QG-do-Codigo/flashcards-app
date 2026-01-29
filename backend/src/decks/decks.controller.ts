/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('decks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  @ApiResponse({
    status: 201,
    description: 'Deck successfully created',
    schema: {
      example: {
        id: 'uuid',
        name: 'Verbos Irregulares',
        description: 'Baralho com verbos irregulares',
        color: '#4F46E5',
        userId: 'user-uuid',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        _count: { cards: 0 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(@Request() req, @Body() createDeckDto: CreateDeckDto) {
    return this.decksService.create(req.user.id, createDeckDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all decks for current user' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for deck name or description',
  })
  @ApiResponse({
    status: 200,
    description: 'List of decks',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Verbos Irregulares',
          description: 'Baralho com verbos irregulares',
          color: '#4F46E5',
          userId: 'user-uuid',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          dueCards: 5,
          _count: { cards: 20 },
          studySessions: [
            {
              cardsReviewed: 15,
              correctAnswers: 12,
              createdAt: '2024-01-15T09:00:00.000Z',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(@Request() req, @Query('search') search?: string) {
    if (search) {
      return this.decksService.searchDecks(req.user.id, search);
    }
    return this.decksService.findAll(req.user.id);
  }

  @Get('due-cards')
  @ApiOperation({ summary: 'Get count of due cards across all decks' })
  @ApiResponse({
    status: 200,
    description: 'Count of due cards',
    schema: {
      example: {
        totalDueCards: 15,
        deckCounts: {
          'deck-uuid-1': 5,
          'deck-uuid-2': 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getDueCardsCount(@Request() req) {
    return this.decksService.getDueCardsCount(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deck by ID' })
  @ApiParam({
    name: 'id',
    description: 'Deck ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Deck details',
    schema: {
      example: {
        id: 'uuid',
        name: 'Verbos Irregulares',
        description: 'Baralho com verbos irregulares',
        color: '#4F46E5',
        userId: 'user-uuid',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        dueCards: 5,
        cards: [
          {
            id: 'card-uuid',
            front: 'Be (ser/estar)',
            back: 'was/were - been',
            example: 'I was happy yesterday.',
            difficulty: 3,
            nextReview: '2024-01-16T10:30:00.000Z',
            interval: 1,
            easeFactor: 2.5,
            reviewCount: 0,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        _count: { cards: 20 },
        studySessions: [
          {
            id: 'session-uuid',
            cardsReviewed: 15,
            correctAnswers: 12,
            duration: 300,
            completed: true,
            createdAt: '2024-01-15T09:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Deck not found',
  })
  findOne(@Request() req, @Param('id') id: string) {
    return this.decksService.findOne(req.user.id, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get deck statistics' })
  @ApiParam({
    name: 'id',
    description: 'Deck ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Deck statistics',
    schema: {
      example: {
        totalCards: 20,
        dueCards: 5,
        averageDifficulty: 3.2,
        sessions: 3,
        todaySession: {
          cardsReviewed: 15,
          correctAnswers: 12,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Deck not found',
  })
  getStats(@Request() req, @Param('id') id: string) {
    return this.decksService.getDeckStats(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deck' })
  @ApiParam({
    name: 'id',
    description: 'Deck ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Deck updated successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'Verbos Irregulares Atualizado',
        description: 'Baralho atualizado',
        color: '#4F46E5',
        userId: 'user-uuid',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T11:00:00.000Z',
        _count: { cards: 20 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Deck not found',
  })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    return this.decksService.update(req.user.id, id, updateDeckDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete deck' })
  @ApiParam({
    name: 'id',
    description: 'Deck ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Deck deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Deck not found',
  })
  remove(@Request() req, @Param('id') id: string) {
    return this.decksService.remove(req.user.id, id);
  }
}
