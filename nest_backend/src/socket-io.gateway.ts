import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './target/location.entity';
import { HistoricalDataParserService } from './historical-data-parser.service';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { timestamp } from 'rxjs';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketIoGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly dataSource: DataSource,
    private readonly historicalDataParser: HistoricalDataParserService,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    // this.subscribeToLocationUpdates();
  }

  async handleConnection(client: Socket) {
    console.log('A user connected:', client.id);

    // Emit parsed historical locations to the client
    const historicalData = await this.historicalDataParser.parseHistoricalLocations();
    client.emit('historical-locations', historicalData);

    // Emit target IDs to the client
    const targetIds = await this.getTargetIds();
    client.emit('target-ids', targetIds);
  }

  handleDisconnect(client: Socket) {
    console.log('A user disconnected:', client.id);
  }

  private async getHistoricalLocations() {
    const locations = await this.dataSource.manager.find(Location, {
      relations: ['target'],
    });
    const groupedLocations = locations.reduce((acc, location) => {
      const targetId = location.target.name;
      if (!acc[targetId]) {
        acc[targetId] = { id: targetId, locations: [] };
      }
      acc[targetId].locations.push({
        lat: location.lat,
        lng: location.lng,
        timestamp: location.timestamp,
      });
      return acc;
    }, {});

    return Object.values(groupedLocations);
  }

  private async getTargetIds() {
    const targets = await this.dataSource.manager.find('Target'); // Assuming 'Target' is the entity name
    return targets.map((target) => { return {id:target.id, name: target.name}}); // Adjust based on the actual structure of the Target entity
  }

  handleRequestTargetIds(client: Socket) {
    this.getTargetIds().then((targetIds) => {
      client.emit('target-ids', targetIds);
    }).catch((error) => {
      console.error('Error fetching target IDs:', error);
    });
  }

  emitHistoricalLocations() {
    this.historicalDataParser.parseHistoricalLocations().then((parsedData) => {
      this.server.emit('historical-locations', JSON.stringify(parsedData));
    });
  }

  handleRequestLastLocation(client: Socket, targetId: string) {
    this.getLastLocation(targetId).then((lastLocation) => {
      if (lastLocation) {
        client.emit("last-location", {
          id: targetId,
          latitude: lastLocation.lat,
          longitude: lastLocation.lng,
          timestamp: lastLocation.timestamp,
        });
      }
    }).catch((error) => {
      console.error(`Error fetching last location for target ${targetId}:`, error);
    });
  }

  private async getLastLocation(targetId: string) {
    const location = await this.dataSource.manager.findOne(Location, {
      where: { target: { name: targetId } },
      order: { timestamp: "DESC" },
    });
    return location;
  }

  afterInit(server: Server) {
    server.on('connection', (socket: Socket) => {
      socket.on('request-target-ids', () => {
        this.handleRequestTargetIds(socket);
      });
      // Add other event listener select-target
      socket.on('select-target', (targetId: string) => {
        this.locationRepository.find({ where: { target: { name: targetId } }, relations: ['target'] }).then((locations) => {
          const locationData = locations.map((location) => ({
            lat: location.lat,
            lng: location.lng,
            timestamp: location.timestamp,
          }));
          socket.emit('historical-locations', { targetId, locations: locationData });
        }).catch((error) => {
          console.error('Error fetching locations for target:', error);
        });
      });
      socket.on("request-last-location", (targetId: string) => {
        this.handleRequestLastLocation(socket, targetId);
      });
    });
  }

  // private subscribeToLocationUpdates() {
  //   this.locationRepository.find({ relations: ['target'] }).then((locations) => {
  //     locations.forEach((location) => {
  //       if (location.target) { // Ensure target is defined
  //         this.server.emit('new-location', {
  //           id: location.target.name,
  //           lat: location.lat,
  //           lng: location.lng,
  //           timestamp: location.timestamp,
  //         });
  //       } else {
  //         console.warn(`Location with ID ${location.id} has no associated target.`);
  //       }
  //     });
  //   }).catch((error) => {
  //     console.error('Error subscribing to location updates:', error);
  //   });
  // }
}