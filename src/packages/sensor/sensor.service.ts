import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum, PeriodAveragesEnum } from 'src/domains/enums';
import { Sensor } from './entities/sensor.entity';
import { convertCSVtoJSON } from 'src/utils';

@Injectable()
export class SensorService {
  private readonly CHUNK_SIZE = 25;

  constructor(private readonly dynamoDBClient: AwsDynamoDBClient) { }

  public async getSensorData(): Promise<any> {
    try {
      const [
        lastDay,
        lastTwoDays,
        lastWeek,
        lastMonth,
      ] = await Promise.all([
        this.dynamoDBClient.scanItems(this.getSensorScanParams(PeriodAveragesEnum.LAST_DAY)),
        this.dynamoDBClient.scanItems(this.getSensorScanParams(PeriodAveragesEnum.LAST_TWO_DAYS)),
        this.dynamoDBClient.scanItems(this.getSensorScanParams(PeriodAveragesEnum.LAST_WEEK)),
        this.dynamoDBClient.scanItems(this.getSensorScanParams(PeriodAveragesEnum.LAST_MONTH)),
      ]);

      return {
        [PeriodAveragesEnum.LAST_DAY]: this.calculateAverage(lastDay),
        [PeriodAveragesEnum.LAST_TWO_DAYS]: this.calculateAverage(lastTwoDays),
        [PeriodAveragesEnum.LAST_WEEK]: this.calculateAverage(lastWeek),
        [PeriodAveragesEnum.LAST_MONTH]: this.calculateAverage(lastMonth),
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async createSensorData(createSensorDto: CreateSensorDto): Promise<Sensor> {
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

  public async createSensorDataFromCsv(file: Express.Multer.File): Promise<Sensor[]> {
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

  private getSensorScanParams(period: PeriodAveragesEnum) {
    const gte = this.getPeriod(period);
    const lte = new Date().toISOString();

    return {
      TableName: DynamodbTablesEnum.SENSORS,
      FilterExpression: '#ts BETWEEN :startDate and :endDate',
      ExpressionAttributeNames: {
        '#ts': 'Timestamp',
      },
      ExpressionAttributeValues: {
        ':startDate': { S: gte },
        ':endDate': { S: lte },
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

  private calculateAverage(sensorData: any[]): number {
    if (sensorData.length === 0) return 0;

    const sum = sensorData.reduce((acc, item) => acc + parseFloat(item.Value.N), 0);
    const average = sum / sensorData.length;

    return Number(average.toFixed(2));
  }
}
