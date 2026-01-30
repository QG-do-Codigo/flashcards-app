import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Card {
  @ApiProperty({
    description: 'ID único do card',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Texto da frente do card (pergunta)',
    example: 'Be (ser/estar)',
    minLength: 1,
  })
  front: string;

  @ApiProperty({
    description: 'Texto do verso do card (resposta)',
    example: 'was/were - been',
    minLength: 1,
  })
  back: string;

  @ApiPropertyOptional({
    description: 'Exemplo de uso (opcional)',
    example: 'I was happy yesterday.',
  })
  example?: string;

  @ApiPropertyOptional({
    description: 'URL para arquivo de áudio (opcional)',
    example: 'https://example.com/audio/be.mp3',
  })
  audioUrl?: string;

  @ApiProperty({
    description: 'ID do baralho a que pertence',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  deckId: string;

  @ApiProperty({
    description: 'Dificuldade atual do card (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  difficulty: number;

  @ApiProperty({
    description: 'Próxima data de revisão',
    example: '2024-01-20T10:30:00.000Z',
  })
  nextReview: Date;

  @ApiProperty({
    description: 'Intervalo atual em dias para próxima revisão',
    example: 6,
  })
  interval: number;

  @ApiProperty({
    description: 'Fator de facilidade (usado no algoritmo SM-2)',
    example: 2.5,
    minimum: 1.3,
  })
  easeFactor: number;

  @ApiProperty({
    description: 'Número de vezes que o card foi revisado',
    example: 5,
    minimum: 0,
  })
  reviewCount: number;

  @ApiProperty({
    description: 'Data de criação do card',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-19T14:45:00.000Z',
  })
  updatedAt: Date;
}
