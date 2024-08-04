import { Module } from '@nestjs/common';
import { SensorModule } from './packages/sensor/sensor.module';
import { AwsDynamoDBModule } from './clients/aws-dynamodb/aws-dynamodb.module';
import { AccessModule } from './packages/access/access.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    AccessModule,
    AwsDynamoDBModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    SensorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
