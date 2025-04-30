import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Target } from './target.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: number;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @ManyToOne(() => Target, (target) => target.locations)
  target: Target;
}