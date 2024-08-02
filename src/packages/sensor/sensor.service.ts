import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum } from 'src/domains/enums';
import { Sensor } from './entities/sensor.entity';

@Injectable()
export class SensorService {
  constructor(private readonly dynamoDBClient: AwsDynamoDBClient) { }

  public async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    try {
      const response = this.dynamoDBClient.insertItem<Sensor>(
        DynamodbTablesEnum.SENSORS,
        new Sensor(createSensorDto)
      );

      return response;
    } catch (error) {
      console.error(error);
    }
  }
}
