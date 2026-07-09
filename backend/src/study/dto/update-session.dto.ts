import { IsInt, IsBoolean, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiProperty({
    example: 15,
    description: 'Quantidade de cards revisados na sessão',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  cardsReviewed: number;

  @ApiProperty({
    example: 12,
    description: 'Quantidade de respostas corretas na sessão',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({
    example: 300,
    description: 'Duração da sessão em segundos',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  duration: number;

  @ApiProperty({
    example: true,
    description: 'Se a sessão foi concluída',
  })
  @IsBoolean()
  completed: boolean;

  @ApiProperty({
    example: 'Sessão de revisão da manhã',
    description: 'Observações sobre a sessão',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
