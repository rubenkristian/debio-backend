import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from '../models/rating.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}
}
