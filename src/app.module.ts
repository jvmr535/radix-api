import { Module } from '@nestjs/common';
import { SensorModule } from './packages/sensor/sensor.module';
import { AwsDynamoDBModule } from './clients/aws-dynamodb/aws-dynamodb.module';

@Module({
  imports: [
    AwsDynamoDBModule,
    SensorModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
