import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum, PeriodAveragesEnum } from 'src/domains/enums';
import { Sensor } from './entities/sensor.entity';
import { convertCSVtoJSON } from 'src/utils';
import { v4 as uuid } from 'uuid';
import { SensorAverage } from './entities/sensor-average.entity';

@Injectable()
export class SensorService {
  private readonly CHUNK_SIZE = 25;

  constructor(private readonly dynamoDBClient: AwsDynamoDBClient) {}

  public async getSensorAveragesData(
    equipmentId: string,
  ): Promise<SensorAverage[]> {
    try {
      const [lastDay, lastTwoDays, lastWeek, lastMonth] = await Promise.all([
        this.dynamoDBClient.queryItems<Sensor>(
          this.getSensorQueryParams(equipmentId, PeriodAveragesEnum.LAST_DAY),
        ),
        this.dynamoDBClient.queryItems<Sensor>(
          this.getSensorQueryParams(
            equipmentId,
            PeriodAveragesEnum.LAST_TWO_DAYS,
          ),
        ),
        this.dynamoDBClient.queryItems<Sensor>(
          this.getSensorQueryParams(equipmentId, PeriodAveragesEnum.LAST_WEEK),
        ),
        this.dynamoDBClient.queryItems<Sensor>(
          this.getSensorQueryParams(equipmentId, PeriodAveragesEnum.LAST_MONTH),
        ),
      ]);

      return [
        { period: '24 horas', value: this.calculateAverage(lastDay) },
        {
          period: '48 horas',
          value: this.calculateAverage(lastTwoDays),
        },
        { period: 'Última semana', value: this.calculateAverage(lastWeek) },
        { period: 'Último mês', value: this.calculateAverage(lastMonth) },
      ];
    } catch (error) {
      throw error;
    }
  }

  public async createSensorData(
    createSensorDto: CreateSensorDto,
  ): Promise<Sensor> {
    try {
      const response = this.dynamoDBClient.insertItem(
        DynamodbTablesEnum.SENSORS,
        {
          EquipmentId: createSensorDto.equipmentId,
          ActivityId: uuid(),
          Timestamp: new Date(createSensorDto.timestamp),
          Value: parseFloat(createSensorDto.value),
        },
      );

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  public async createSensorDataFromCsv(
    file: Express.Multer.File,
  ): Promise<Sensor[]> {
    try {
      const csv = file.buffer.toString('utf8');
      const csvToJsonData = convertCSVtoJSON<CreateSensorDto>(csv);
      const convertedData = csvToJsonData.map((data) => ({
        EquipmentId: data.equipmentId,
        ActivityId: uuid(),
        Timestamp: new Date(data.timestamp),
        Value: parseFloat(data.value),
      }));

      await this.dynamoDBClient.batchInsertItems<Sensor>(
        DynamodbTablesEnum.SENSORS,
        convertedData,
        this.CHUNK_SIZE,
      );

      return convertedData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getSensorQueryParams(
    equipmentId: string,
    period: PeriodAveragesEnum,
  ) {
    const gte = this.getPeriod(period);
    const lte = new Date().toISOString();

    return {
      TableName: DynamodbTablesEnum.SENSORS,
      IndexName: 'EquipmentId-Timestamp-Index',
      KeyConditionExpression:
        'EquipmentId = :equipmentId AND #timestamp BETWEEN :gte AND :lte',
      ExpressionAttributeNames: {
        '#timestamp': 'Timestamp',
      },
      ExpressionAttributeValues: {
        ':equipmentId': { S: equipmentId },
        ':gte': { S: gte },
        ':lte': { S: lte },
      },
    };
  }

  private getPeriod(period: PeriodAveragesEnum): string {
    switch (period) {
      case PeriodAveragesEnum.LAST_DAY:
        return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      case PeriodAveragesEnum.LAST_TWO_DAYS:
        return new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      case PeriodAveragesEnum.LAST_WEEK:
        return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case PeriodAveragesEnum.LAST_MONTH:
        return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private calculateAverage(sensorData: Sensor[]): number {
    if (
      sensorData === undefined ||
      sensorData === null ||
      sensorData.length === 0
    ) {
      return 0;
    }

    const sum = sensorData.reduce((acc, curr) => acc + curr.Value, 0);

    const average = sum / sensorData.length;

    return Number(average.toFixed(2));
  }
}
