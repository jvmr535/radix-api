import { AwsDynamoDBClient } from '../aws-dynamodb.client';
import { CreateAccessDto } from 'src/packages/access/dto/create-access.dto';
import { v4 as uuid } from 'uuid';
import { encryptString } from '../../../utils/encrypt-string';
import { DynamodbTablesEnum, EnvKeys } from '../../../domains/enums';
import { ConfigService } from '@nestjs/config';

export async function seedUserAwsDynamoDB(
  configService: ConfigService,
): Promise<boolean> {
  try {
    const dynamoDBClient = new AwsDynamoDBClient();

    const createAccessDto: CreateAccessDto = {
      username: configService.get<string>(EnvKeys.SEED_USERNAME),
      password: configService.get<string>(EnvKeys.SEED_PASSWORD),
      isActive: true,
    };

    const encryptionKey = configService.get<string>(EnvKeys.ENCRYPTION_KEY);

    await dynamoDBClient.insertItem(DynamodbTablesEnum.ACCESS, {
      UserAccessKey: uuid(),
      Username: createAccessDto.username,
      Password: encryptString(createAccessDto.password, encryptionKey),
      IsActive: createAccessDto.isActive,
    });

    return true;
  } catch (error) {
    console.error('Error seeding user:', error);
    return false;
  }
}
