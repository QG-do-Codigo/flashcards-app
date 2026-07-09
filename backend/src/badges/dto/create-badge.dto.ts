import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { BadgeType } from '@prisma/client';

export class CreateBadgeDto {
  @IsEnum(BadgeType)
  type: BadgeType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  color?: string;
}
