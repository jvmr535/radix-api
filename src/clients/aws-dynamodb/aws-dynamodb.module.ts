import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsDynamoDBClient } from './aws-dynamodb.client';

@Module({
    imports: [ConfigModule],
    providers: [AwsDynamoDBClient],
    exports: [AwsDynamoDBClient],
})
export class AwsDynamoDBModule { }
