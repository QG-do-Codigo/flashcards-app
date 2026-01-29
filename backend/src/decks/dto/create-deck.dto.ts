import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Verbos Irregulares',
    description: 'Nome do baralho',
    minLength: 3,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Baralho com os verbos irregulares mais comuns em inglês',
    description: 'Descrição do baralho',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '#4F46E5',
    description: 'Cor do baralho em formato hexadecimal',
    pattern: '^#[0-9A-F]{6}$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i)
  color?: string;
}
