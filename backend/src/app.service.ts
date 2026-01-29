import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Flashcards API v1.0 is running!';
  }

  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'flashcards-api',
      version: '1.0.0',
    };
  }
}
