import { Module } from '@nestjs/common';
import { RatingController } from 'src/controllers/rating.controller';
import { RatingService } from 'src/services/rating.service';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
