import { Injectable } from '@nestjs/common';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { AuthAccess } from './entities/auth-access.entity';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { JwtService } from '../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { Access } from './entities/access.entity';
import { DynamodbTablesEnum, EnvKeys } from 'src/domains/enums';
import { decryptString } from 'src/utils/decrypt-string';
import { UnauthorizedError } from 'src/error';

@Injectable()
export class AccessService {
  constructor(
    private readonly dynamoDBClient: AwsDynamoDBClient,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async signIn(
    loginCredentials: LoginCredentialsDto,
  ): Promise<AuthAccess> {
    try {
      const { UserAccessKey, Username, IsActive, Password } = (
        await this.dynamoDBClient.queryItems<Access>({
          TableName: DynamodbTablesEnum.ACCESS,
          IndexName: 'UsernameIndex',
          KeyConditionExpression: 'Username = :username',
          ExpressionAttributeValues: {
            ':username': { S: loginCredentials.username },
          },
        })
      )[0];

      const decryptedPassword = decryptString(
        Password,
        this.configService.get<string>(EnvKeys.ENCRYPTION_KEY),
      );

      if (loginCredentials.password === decryptedPassword) {
        const payload = {
          userAccessKey: UserAccessKey,
          username: Username,
          isActive: IsActive,
        };

        const expiresIn = '24h';

        return {
          accessToken: this.jwtService.sign(payload, { expiresIn }),
        };
      }

      return {
        accessToken: null,
      };
    } catch (error) {
      console.log('Error signing in:', error);
      throw new UnauthorizedError('Não foi possível realizar o login');
    }
  }
}
