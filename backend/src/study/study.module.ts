import { Module } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  providers: [StudyService],
  controllers: [StudyController]
})
export class StudyModule {}
