import { Test, TestingModule } from '@nestjs/testing';
import { SensorService } from '../sensor.service';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateSensorDto } from '../dto/create-sensor.dto';
import { Sensor } from '../entities/sensor.entity';
import { DynamodbTablesEnum } from 'src/domains/enums';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';

describe('SensorService', () => {
  let service: SensorService;
  let dynamoDBClient: AwsDynamoDBClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorService,
        {
          provide: AwsDynamoDBClient,
          useValue: {
            queryItems: jest.fn(),
            insertItem: jest.fn(),
            batchInsertItems: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SensorService>(SensorService);
    dynamoDBClient = module.get<AwsDynamoDBClient>(AwsDynamoDBClient);
  });

  describe('getSensorAveragesData', () => {
    it('should return sensor averages for different periods', async () => {
      const equipmentId = 'test-equipment';
      const mockData: Sensor[] = [
        {
          EquipmentId: equipmentId,
          ActivityId: '1',
          Timestamp: new Date(),
          Value: 10,
        },
        {
          EquipmentId: equipmentId,
          ActivityId: '2',
          Timestamp: new Date(),
          Value: 20,
        },
      ];

      jest.spyOn(dynamoDBClient, 'queryItems').mockResolvedValue(mockData);

      const result = await service.getSensorAveragesData(equipmentId);

      expect(result).toEqual([
        { period: '24 horas', value: 15 },
        { period: '48 horas', value: 15 },
        { period: 'Última semana', value: 15 },
        { period: 'Último mês', value: 15 },
      ]);

      expect(dynamoDBClient.queryItems).toHaveBeenCalledTimes(4);
    });

    it('should throw InternalServerErrorException if fetching averages fails', async () => {
      jest
        .spyOn(dynamoDBClient, 'queryItems')
        .mockRejectedValue(new Error('Failed to fetch'));

      await expect(
        service.getSensorAveragesData('test-equipment'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createSensorData', () => {
    it('should create sensor data and return it', async () => {
      const createSensorDto: CreateSensorDto = {
        equipmentId: 'test-equipment',
        timestamp: '2024-08-05T00:00:00.000Z',
        value: 50,
      };

      const expectedResponse: Sensor = {
        EquipmentId: createSensorDto.equipmentId,
        ActivityId: expect.any(String),
        Timestamp: new Date(createSensorDto.timestamp),
        Value: 50,
      };

      jest
        .spyOn(dynamoDBClient, 'insertItem')
        .mockResolvedValue(expectedResponse);

      const result = await service.createSensorData(createSensorDto);

      expect(result).toEqual(expectedResponse);
      expect(dynamoDBClient.insertItem).toHaveBeenCalledWith(
        DynamodbTablesEnum.SENSORS,
        expect.objectContaining({
          EquipmentId: createSensorDto.equipmentId,
          Value: 50,
        }),
      );
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      jest
        .spyOn(dynamoDBClient, 'insertItem')
        .mockRejectedValue(new Error('Failed to insert'));

      const createSensorDto: CreateSensorDto = {
        equipmentId: 'test-equipment',
        timestamp: '2024-08-05T00:00:00.000Z',
        value: 50,
      };

      await expect(service.createSensorData(createSensorDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createSensorDataFromCsv', () => {
    it('should create sensor data from CSV and return it', async () => {
      const file: Express.Multer.File = {
        buffer: Buffer.from(
          'equipmentId,timestamp,value\n1,2024-08-05T00:00:00.000Z,100\n',
        ),
        originalname: 'test.csv',
        mimetype: 'text/csv',
        size: 100,
        stream: null,
        fieldname: '',
        destination: '',
        filename: '',
        path: '',
        encoding: '',
      };

      const expectedData: Sensor[] = [
        {
          EquipmentId: '1',
          ActivityId: expect.any(String),
          Timestamp: new Date('2024-08-05T00:00:00.000Z'),
          Value: 100,
        },
      ];

      jest
        .spyOn(dynamoDBClient, 'batchInsertItems')
        .mockResolvedValue(expectedData);

      const result = await service.createSensorDataFromCsv(file);

      expect(result).toEqual(expectedData);
      expect(dynamoDBClient.batchInsertItems).toHaveBeenCalledWith(
        DynamodbTablesEnum.SENSORS,
        expect.arrayContaining([
          expect.objectContaining({ EquipmentId: '1', Value: 100 }),
        ]),
        expect.any(Number),
      );
    });

    it('should throw InternalServerErrorException if CSV creation fails', async () => {
      jest
        .spyOn(dynamoDBClient, 'batchInsertItems')
        .mockRejectedValue(new Error('Failed to insert'));

      const file: Express.Multer.File = {
        buffer: Buffer.from(
          'equipmentId,timestamp,value\n1,2024-08-05T00:00:00.000Z,100\n',
        ),
        originalname: 'test.csv',
        mimetype: 'text/csv',
        size: 100,
        stream: null,
        fieldname: '',
        destination: '',
        filename: '',
        path: '',
        encoding: '',
      };

      await expect(service.createSensorDataFromCsv(file)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
