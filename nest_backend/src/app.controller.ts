import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService , LocationService} from './app.service';
import { SocketIoGateway } from './socket-io.gateway';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Target } from './target/target.entity';
import { Location } from './target/location.entity';

@Controller()
export class AppController {
  constructor(private readonly locService: LocationService) {}

  @Get()
  getLocation(): string {
    return this.locService.getLocation();
  }
}

@Controller('target-locations')
export class TargetLocationsController {
  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}


  @Post()
  async receiveTargetData(@Body() data: any): Promise<void> {
    const targetId = data.target;
    const timestamp= new Date(data.time).getTime();
    const result = data.data.split(',');
    let target = await this.targetRepository.findOne({ where: { name: targetId } });

    if (!target) {
      target = new Target();
      target.name = targetId;
      target.locations = [];
      await this.targetRepository.save(target);
    }

    let location = await this.locationRepository.findOne({
      where: {
      lat: result[0],
      lng: result[1],
      target: target,
      },
    });

    if (!location) {
      location = new Location();
      location.lat = result[0];
      location.lng = result[1];
      location.timestamp = timestamp;
      location.target = target;

      await this.locationRepository.save(location);
    }

    await this.locationRepository.save(location);
  }
}
