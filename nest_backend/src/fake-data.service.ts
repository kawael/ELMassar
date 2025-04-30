import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Target } from './target/target.entity';
import { Location } from './target/location.entity';

@Injectable()
export class FakeDataService implements OnModuleInit {
  private readonly filePath = './data_watch/historical-locations.json';

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    setInterval(() => this.addNewLocation(), 10000);
  }

  private async addNewLocation() {
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));

    for (const targetData of data.targets) {
      let target = await this.dataSource.manager.findOne(Target, {
        where: { name: targetData.id },
        relations: ['locations'],
      });

      if (!target) {
        target = new Target();
        target.name = targetData.id;
        target.locations = [];
        await this.dataSource.manager.save(target);
        console.log(`Created new target with id ${targetData.id} in the database.`);
      }

      const locations = targetData.locations;
      const lastLocation = locations[locations.length - 1];
      const secondLastLocation = locations[locations.length - 2];

      const deltaLat = lastLocation.lat - secondLastLocation.lat;
      const deltaLng = lastLocation.lng - secondLastLocation.lng;

      const newLat = parseFloat((lastLocation.lat + deltaLat).toFixed(6));
      const newLng = parseFloat((lastLocation.lng + deltaLng).toFixed(6));
      const newTimestamp = lastLocation.timestamp + 10000; // Add 10 seconds

      const newLocation = {
        timestamp: newTimestamp,
        lat: newLat,
        lng: newLng,
      };

      targetData.locations.push(newLocation);
      const locationEntity = new Location();
      locationEntity.timestamp = newTimestamp;
      locationEntity.lat = newLat;
      locationEntity.lng = newLng;
      locationEntity.target = target;

      await this.dataSource.manager.save(locationEntity);
    }

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('New locations added to historical-locations.json and database.');
  }
}