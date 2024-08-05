import { Test, TestingModule } from '@nestjs/testing';
import { AccessService } from '../access.service';
import { JwtService } from 'src/packages/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCredentialsDto } from '../dto/login-credentials.dto';
import { DynamodbTablesEnum } from 'src/domains/enums/dynamodb-tables.enum';
import { Access } from '../entities/access.entity';
import * as utils from 'src/utils/decrypt-string';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';

jest.mock('src/utils/decrypt-string');

describe('AccessService', () => {
  let service: AccessService;
  let dynamoDBClient: AwsDynamoDBClient;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        {
          provide: AwsDynamoDBClient,
          useValue: {
            queryItems: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
    dynamoDBClient = module.get<AwsDynamoDBClient>(AwsDynamoDBClient);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('signIn', () => {
    it('should return an access token for valid credentials', async () => {
      const loginCredentials: LoginCredentialsDto = {
        username: 'testuser',
        password: 'testpassword',
      };

      const mockAccess: Access = {
        UserAccessKey: 'user-access-key',
        Username: 'testuser',
        IsActive: true,
        Password: 'encryptedpassword',
      };

      jest.spyOn(dynamoDBClient, 'queryItems').mockResolvedValue([mockAccess]);
      jest.spyOn(configService, 'get').mockReturnValue('encryption-key');
      jest.spyOn(utils, 'decryptString').mockReturnValue('testpassword');
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await service.signIn(loginCredentials);

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(dynamoDBClient.queryItems).toHaveBeenCalledWith({
        TableName: DynamodbTablesEnum.ACCESS,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
          ':username': { S: 'testuser' },
        },
      });
      expect(utils.decryptString).toHaveBeenCalledWith(
        'encryptedpassword',
        'encryption-key',
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          userAccessKey: 'user-access-key',
          username: 'testuser',
          isActive: true,
        },
        { expiresIn: '24h' },
      );
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      const loginCredentials: LoginCredentialsDto = {
        username: 'invaliduser',
        password: 'testpassword',
      };

      jest.spyOn(dynamoDBClient, 'queryItems').mockResolvedValue([]);

      await expect(service.signIn(loginCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginCredentials: LoginCredentialsDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockAccess: Access = {
        UserAccessKey: 'user-access-key',
        Username: 'testuser',
        IsActive: true,
        Password: 'encryptedpassword',
      };

      jest.spyOn(dynamoDBClient, 'queryItems').mockResolvedValue([mockAccess]);
      jest.spyOn(configService, 'get').mockReturnValue('encryption-key');
      jest.spyOn(utils, 'decryptString').mockReturnValue('testpassword');

      await expect(service.signIn(loginCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if an error occurs', async () => {
      const loginCredentials: LoginCredentialsDto = {
        username: 'testuser',
        password: 'testpassword',
      };

      jest
        .spyOn(dynamoDBClient, 'queryItems')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.signIn(loginCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
