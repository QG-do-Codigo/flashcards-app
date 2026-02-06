import { IsInt, IsBoolean, Min, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsInt()
  @Min(0)
  cardsReviewed: number;

  @IsInt()
  @Min(0)
  correctAnswers: number;

  @IsInt()
  @Min(0)
  duration: number;

  @IsBoolean()
  completed: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
