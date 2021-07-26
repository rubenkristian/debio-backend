import { Module } from '@nestjs/common';
import { RatingController } from 'src/modules/rating/rating.controller';
import { RatingService } from 'src/modules/rating/rating.service';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
