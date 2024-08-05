import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { AuthAccess } from './entities/auth-access.entity';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { JwtService } from '../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { Access } from './entities/access.entity';
import { DynamodbTablesEnum, EnvKeys } from 'src/domains/enums';
import { decryptString } from 'src/utils/decrypt-string';

@Injectable()
export class AccessService {
  private readonly tokenExpiry = '24h';

  constructor(
    private readonly dynamoDBClient: AwsDynamoDBClient,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async signIn(
    loginCredentials: LoginCredentialsDto,
  ): Promise<AuthAccess> {
    const { username, password } = loginCredentials;

    try {
      const [userAccess] = await this.dynamoDBClient.queryItems<Access>({
        TableName: DynamodbTablesEnum.ACCESS,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
          ':username': { S: username },
        },
      });

      if (!userAccess) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { UserAccessKey, Username, IsActive, Password } = userAccess;

      const decryptedPassword = decryptString(
        Password,
        this.configService.get<string>(EnvKeys.ENCRYPTION_KEY),
      );

      if (password !== decryptedPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userAccessKey: UserAccessKey,
        username: Username,
        isActive: IsActive,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.tokenExpiry,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Unable to sign in');
    }
  }
}
