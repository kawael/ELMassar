import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Target } from './target/target.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Target)
    private targetRepository: Repository<Target>,
  ) {}

  findAll(): Promise<Target[]> {
    return this.targetRepository.find();
  }

  create(target: Partial<Target>): Promise<Target> {
    return this.targetRepository.save(target);
  }
}