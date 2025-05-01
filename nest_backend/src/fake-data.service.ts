import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import * as path from 'path';
import * as csvWriter from 'csv-writer';
import { Target } from './target/target.entity';
import { Location } from './target/location.entity';

@Injectable()
export class FakeDataService implements OnModuleInit {
  private readonly filePath = path.join(__dirname, '../data_watch/historical-locations.csv');

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    setInterval(() => this.addNewLocation(), 10000);
  }

  private async addNewLocation() {
    const results: any[] = [];

    // Read the CSV file
    fs.createReadStream(this.filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const targetData of results) {
          let target = await this.dataSource.manager.findOne(Target, {
            where: { name: targetData.targetId },
            relations: ['locations'],
          });

          if (!target) {
            target = new Target();
            target.name = targetData.targetId;
            target.locations = [];
            await this.dataSource.manager.save(target);
            console.log(`Created new target with id ${targetData.targetId} in the database.`);
          }

          const lastLocation = {
            lat: parseFloat(targetData.lat),
            lng: parseFloat(targetData.lng),
            timestamp: parseInt(targetData.timestamp, 10),
          };

          const newLat = parseFloat((lastLocation.lat + 0.001).toFixed(6));
          const newLng = parseFloat((lastLocation.lng + 0.001).toFixed(6));
          const newTimestamp = lastLocation.timestamp + 10000; // Add 10 seconds

          const newLocation = {
            timestamp: newTimestamp,
            lat: newLat,
            lng: newLng,
            targetId: targetData.targetId,
          };

          const locationEntity = new Location();
          locationEntity.timestamp = newTimestamp;
          locationEntity.lat = newLat;
          locationEntity.lng = newLng;
          locationEntity.target = target;

          await this.dataSource.manager.save(locationEntity);

          // Append the new location to the CSV file
          const writer = csvWriter.createObjectCsvWriter({
            path: this.filePath,
            header: [
              { id: 'lat', title: 'lat' },
              { id: 'lng', title: 'lng' },
              { id: 'timestamp', title: 'timestamp' },
              { id: 'targetId', title: 'targetId' },
            ],
            append: true,
          });

          await writer.writeRecords([newLocation]);
        }

        console.log('New locations added to historical-locations.csv and database.');
      });
  }
}