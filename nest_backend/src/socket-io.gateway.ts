import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Location } from './target/location.entity';
import { HistoricalDataParserService } from './historical-data-parser.service';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketIoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly dataSource: DataSource,
    private readonly historicalDataParser: HistoricalDataParserService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('A user connected:', client.id);

    // Emit parsed historical locations to the client
    const historicalData = await this.getHistoricalLocations();
    // console.log(historicalData)
    // const parsedData = this.historicalDataParser.parseHistoricalLocations(historicalData);
    client.emit('historical-locations', JSON.stringify(historicalData));
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

  emitHistoricalLocations() {
    this.getHistoricalLocations().then((historicalData) => {
      const parsedData = this.historicalDataParser.parseHistoricalLocations(historicalData);
      this.server.emit('historical-locations', JSON.stringify(parsedData));
    });
  }
}