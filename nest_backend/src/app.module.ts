import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricalDataParserService } from './historical-data-parser.service';
// import { FakeDataService } from './fake-data.service';
import { SocketIoGateway } from './socket-io.gateway';
import { Location } from './target/location.entity';

@Module({
  imports: [
    // PostgreSQL connection
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'your_postgres_user',
    //   password: 'your_postgres_password',
    //   database: 'your_postgres_db',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true, // Set to false in production
    // }),
    // SQLite connection
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'elmassar.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([Location]),
  ],
  controllers: [AppController],
  // FakeDataService,
  providers: [AppService, SocketIoGateway,HistoricalDataParserService ],
})
export class AppModule {}
