import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedError } from 'src/error';
import { JwtTokenPayload } from 'src/packages/jwt/entity/jwt-token-payload.entity';
import { ConfigService } from '@nestjs/config';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum, EnvKeys } from 'src/domains/enums';
import { Access } from 'src/packages/access/entities/access.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly dynamoDBClient: AwsDynamoDBClient,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(EnvKeys.JWT_SECRET),
    });
  }

  async validate(payload: JwtTokenPayload) {
    const { UserAccessKey, Username, IsActive } = (
      await this.dynamoDBClient.queryItems<Access>({
        TableName: DynamodbTablesEnum.ACCESS,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
          ':username': { S: payload.Username },
        },
      })
    )[0];

    if (UserAccessKey !== payload.UserAccessKey) {
      throw new UnauthorizedError('Usuário não autorizado');
    }

    return {
      UserAccessKey,
      Username,
      IsActive,
    };
  }
}
