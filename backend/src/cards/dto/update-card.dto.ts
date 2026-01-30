import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiPropertyOptional({
    description: 'Texto da frente do card (pergunta)',
    example: 'Be (ser/estar)',
    minLength: 1,
  })
  front?: string;

  @ApiPropertyOptional({
    description: 'Texto do verso do card (resposta)',
    example: 'was/were - been',
    minLength: 1,
  })
  back?: string;

  @ApiPropertyOptional({
    description: 'Exemplo de uso (opcional)',
    example: 'I was very happy yesterday.',
  })
  example?: string;

  @ApiPropertyOptional({
    description: 'URL para arquivo de áudio (opcional)',
    example: 'https://example.com/audio/be.mp3',
  })
  audioUrl?: string;
}
