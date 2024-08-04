import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UnauthorizedError } from 'src/error';
import { JwtService } from '@nestjs/jwt';
import { Access } from 'src/packages/access/entities/access.entity';
import { AwsDynamoDBClient } from 'src/clients/aws-dynamodb/aws-dynamodb.client';
import { DynamodbTablesEnum } from 'src/domains/enums';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  public async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      const payload = await this.getTokenPayload(token);

      const { IsActive } = await this.getAccessByUser(payload.username);

      if (!IsActive) {
        throw new UnauthorizedError('Usuário não autorizado');
      }

      return true;
    } catch (err) {
      throw new UnauthorizedError('Usuário não autorizado');
    }
  }

  public handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedError('Usuário não autorizado');
    }
    return user;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getTokenPayload(token: string) {
    if (!token) {
      throw new UnauthorizedError('Usuário não autorizado');
    }

    const payload = await new JwtService().verifyAsync(token, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return payload;
  }

  private async getAccessByUser(username: string): Promise<Access> {
    const dynamoDBClient = new AwsDynamoDBClient();

    return (
      await dynamoDBClient.queryItems<Access>({
        TableName: DynamodbTablesEnum.ACCESS,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
          ':username': { S: username },
        },
      })
    )[0];
  }
}
