import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum } from 'src/domains/enums';
import { Sensor } from './entities/sensor.entity';
import { convertCSVtoJSON } from '../utils';

@Injectable()
export class SensorService {
  private readonly CHUNK_SIZE = 25;

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

  public async createFromCsv(file: Express.Multer.File): Promise<Sensor[]> {
    try {
      const csv = file.buffer.toString('utf8');
      const csvToJsonData = convertCSVtoJSON<CreateSensorDto>(csv);
      const convertedData = csvToJsonData.map((data) => new Sensor(data));

      const response = this.dynamoDBClient.batchInsertItems<Sensor>(
        DynamodbTablesEnum.SENSORS,
        convertedData,
        this.CHUNK_SIZE
      );

      return convertedData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
