import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { AwsDynamoDBModule } from 'src/clients/aws-dynamodb/aws-dynamodb.module';

@Module({
  imports: [AwsDynamoDBModule],
  controllers: [SensorController],
  providers: [SensorService],
})
export class SensorModule { }
