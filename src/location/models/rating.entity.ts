import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ratings' })
export class Rating {
  @PrimaryGeneratedColumn()
  id: string;
}
