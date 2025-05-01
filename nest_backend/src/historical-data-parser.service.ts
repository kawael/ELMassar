import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Location } from './target/location.entity';

@Injectable()
export class HistoricalDataParserService {
  constructor(private readonly dataSource: DataSource) {}

  async parseHistoricalLocations(): Promise<any[]> {
    const locations = await this.dataSource.manager.find(Location, {
      relations: ['target'],
    });

    return locations.map((location) => ({
      lat: location.lat,
      lng: location.lng,
      timestamp: location.timestamp,
      targetId: location.target ? location.target.name : null,
    }));
  }
}