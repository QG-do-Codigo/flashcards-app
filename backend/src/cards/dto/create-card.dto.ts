import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    description: 'Texto da frente do card (pergunta)',
    example: 'Be (ser/estar)',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  front: string;

  @ApiProperty({
    description: 'Texto do verso do card (resposta)',
    example: 'was/were - been',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  back: string;

  @ApiPropertyOptional({
    description: 'Exemplo de uso (opcional)',
    example: 'I was happy yesterday.',
  })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiPropertyOptional({
    description: 'URL para arquivo de áudio (opcional)',
    example: 'https://example.com/audio/be.mp3',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  audioUrl?: string;
}
