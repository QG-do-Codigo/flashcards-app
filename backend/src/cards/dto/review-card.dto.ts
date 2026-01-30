import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewCardDto {
  @ApiProperty({
    description: 'Nível de dificuldade da revisão (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
    enum: [1, 2, 3, 4, 5],
  })
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number; // 1: Muito difícil, 5: Muito fácil
}
