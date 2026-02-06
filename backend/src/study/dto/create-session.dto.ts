import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  deckId: string;
}
