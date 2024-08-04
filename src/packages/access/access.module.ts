import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { JwtModule } from '../jwt/jwt.module';
import { AwsDynamoDBModule } from 'src/clients/aws-dynamodb/aws-dynamodb.module';
import { AccessController } from './access.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  controllers: [AccessController],
  imports: [JwtModule, AwsDynamoDBModule],
  providers: [AccessService, JwtStrategy],
})
export class AccessModule { }
