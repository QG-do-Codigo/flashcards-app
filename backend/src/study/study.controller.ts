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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StudyService } from './study.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Start a new study session' })
  @ApiResponse({
    status: 201,
    description: 'Session successfully created',
    schema: {
      example: {
        id: 'session-uuid',
        userId: 'user-uuid',
        deckId: 'deck-uuid',
        cardsReviewed: 0,
        correctAnswers: 0,
        duration: 0,
        completed: false,
        createdAt: '2026-07-08T10:30:00.000Z',
        updatedAt: '2026-07-08T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  startSession(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.studyService.startSession(req.user.id, createSessionDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get study sessions for current user' })
  @ApiQuery({
    name: 'deckId',
    required: false,
    description: 'Filter sessions by deck ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of sessions to return',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of study sessions',
    schema: {
      example: [
        {
          id: 'session-uuid',
          userId: 'user-uuid',
          deckId: 'deck-uuid',
          cardsReviewed: 15,
          correctAnswers: 12,
          duration: 300,
          completed: true,
          createdAt: '2026-07-08T10:30:00.000Z',
          updatedAt: '2026-07-08T10:35:00.000Z',
          deck: { id: 'deck-uuid', name: 'Verbos Irregulares', color: '#4F46E5' },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Request() req,
    @Query('deckId') deckId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studyService.findAll(
      req.user.id,
      deckId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get study session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID', example: 'session-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    schema: {
      example: {
        id: 'session-uuid',
        userId: 'user-uuid',
        deckId: 'deck-uuid',
        cardsReviewed: 15,
        correctAnswers: 12,
        duration: 300,
        completed: true,
        createdAt: '2026-07-08T10:30:00.000Z',
        updatedAt: '2026-07-08T10:35:00.000Z',
        deck: { id: 'deck-uuid', name: 'Verbos Irregulares', color: '#4F46E5' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.studyService.findOne(req.user.id, id);
  }

  @Patch('sessions/:id')
  @ApiOperation({ summary: 'Update study session' })
  @ApiParam({ name: 'id', description: 'Session ID', example: 'session-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
    schema: {
      example: {
        id: 'session-uuid',
        userId: 'user-uuid',
        deckId: 'deck-uuid',
        cardsReviewed: 15,
        correctAnswers: 12,
        duration: 300,
        completed: true,
        createdAt: '2026-07-08T10:30:00.000Z',
        updatedAt: '2026-07-08T10:35:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  updateSession(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.studyService.updateSession(req.user.id, id, updateSessionDto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete study session' })
  @ApiParam({ name: 'id', description: 'Session ID', example: 'session-uuid' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.studyService.remove(req.user.id, id);
  }
}
