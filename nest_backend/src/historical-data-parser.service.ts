import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoricalDataParserService {
  parseHistoricalLocations(data: any): any {
    // Example: Parse the historical locations data and return a structured format
    if (!data || !data.targets) {
    return data.targets.map((target: any) => ({
      id: target.name,
      locations: target.locations.map((location: any) => ({
        timestamp: new Date(location.timestamp),
        latitude: location.lat,
        longitude: location.lng,
      })),
    }));
  }else{
    return [];
  }
  }
}