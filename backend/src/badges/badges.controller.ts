import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('badges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all badges earned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of earned badges',
    schema: {
      example: [
        {
          id: 'badge-uuid',
          userId: 'user-uuid',
          type: 'FIRST_DECK',
          title: 'First Deck',
          description: 'Created your first deck',
          icon: '🎯',
          color: '#4F46E5',
          earnedAt: '2026-07-08T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.badgesService.findAll(req.user.id);
  }
}
