import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    example: 'deck-uuid',
    description: 'ID do baralho a ser estudado',
  })
  @IsString()
  @IsNotEmpty()
  deckId: string;
}
