import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Target } from './target/target.entity';
import { Location } from './target/location.entity';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    const filePath = './data_watch/historical-locations.json';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const targetData of data.targets) {
      const target = new Target();
      target.id = targetData.id;
      target.locations = [];

      for (const locationData of targetData.locations) {
        const location = new Location();
        location.timestamp = locationData.timestamp;
        location.lat = locationData.lat;
        location.lng = locationData.lng;
        target.locations.push(location);
      }

      await this.dataSource.manager.save(target);
    }

    console.log('Database seeded with historical locations.');
  }
}