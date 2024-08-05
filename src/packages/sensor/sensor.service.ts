import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  private readonly DATE_NOW = Date.now();

  constructor(private readonly dynamoDBClient: AwsDynamoDBClient) {}

  public async getSensorAveragesData(
    equipmentId: string,
  ): Promise<SensorAverage[]> {
    try {
      const periods = [
        PeriodAveragesEnum.LAST_DAY,
        PeriodAveragesEnum.LAST_TWO_DAYS,
        PeriodAveragesEnum.LAST_WEEK,
        PeriodAveragesEnum.LAST_MONTH,
      ];

      const queries = periods.map((period) =>
        this.dynamoDBClient.queryItems<Sensor>(
          this.getSensorQueryParams(equipmentId, period),
        ),
      );

      const [lastDay, lastTwoDays, lastWeek, lastMonth] =
        await Promise.all(queries);

      return [
        { period: '24 horas', value: this.calculateAverage(lastDay) },
        { period: '48 horas', value: this.calculateAverage(lastTwoDays) },
        { period: 'Última semana', value: this.calculateAverage(lastWeek) },
        { period: 'Último mês', value: this.calculateAverage(lastMonth) },
      ];
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sensor averages');
    }
  }

  public async createSensorData(
    createSensorDto: CreateSensorDto,
  ): Promise<Sensor> {
    try {
      const { equipmentId, timestamp, value } = createSensorDto;

      const sensorData = {
        EquipmentId: equipmentId,
        ActivityId: uuid(),
        Timestamp: new Date(timestamp),
        Value: typeof value === 'string' ? parseFloat(value) : value,
      };

      const response = await this.dynamoDBClient.insertItem(
        DynamodbTablesEnum.SENSORS,
        sensorData,
      );

      return response;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create sensor data');
    }
  }

  public async createSensorDataFromCsv(
    file: Express.Multer.File,
  ): Promise<Sensor[]> {
    try {
      const csv = file.buffer.toString('utf8');
      const csvToJsonData = convertCSVtoJSON<CreateSensorDto>(csv);

      const convertedData = csvToJsonData.map(
        ({ equipmentId, timestamp, value }) => ({
          EquipmentId: equipmentId,
          ActivityId: uuid(),
          Timestamp: new Date(timestamp),
          Value: typeof value === 'string' ? parseFloat(value) : value,
        }),
      );

      await this.dynamoDBClient.batchInsertItems<Sensor>(
        DynamodbTablesEnum.SENSORS,
        convertedData,
        this.CHUNK_SIZE,
      );

      return convertedData;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create sensor data from CSV',
      );
    }
  }

  private getSensorQueryParams(
    equipmentId: string,
    period: PeriodAveragesEnum,
  ) {
    const gte = this.getPeriodStart(period);
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

  private getPeriodStart(period: PeriodAveragesEnum): string {
    const periodsInMs = {
      [PeriodAveragesEnum.LAST_DAY]: 24 * 60 * 60 * 1000,
      [PeriodAveragesEnum.LAST_TWO_DAYS]: 2 * 24 * 60 * 60 * 1000,
      [PeriodAveragesEnum.LAST_WEEK]: 7 * 24 * 60 * 60 * 1000,
      [PeriodAveragesEnum.LAST_MONTH]: 30 * 24 * 60 * 60 * 1000,
    };

    return new Date(
      this.DATE_NOW -
        (periodsInMs[period] || periodsInMs[PeriodAveragesEnum.LAST_DAY]),
    ).toISOString();
  }

  private calculateAverage(sensorData: Sensor[]): number {
    if (!sensorData?.length) {
      return 0;
    }

    const sum = sensorData.reduce((acc, curr) => acc + curr.Value, 0);
    const average = sum / sensorData.length;

    return Number(average.toFixed(2));
  }
}
