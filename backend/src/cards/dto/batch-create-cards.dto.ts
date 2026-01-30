import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateCardDto } from './create-card.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BatchCreateCardsDto {
  @ApiProperty({
    description: 'Lista de cards a serem criados',
    type: [CreateCardDto],
    example: [
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
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCardDto)
  cards: CreateCardDto[];
}
