import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from './location.entity';

@Entity()
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Location, (location) => location.target, { cascade: true })
  locations: Location[];
}