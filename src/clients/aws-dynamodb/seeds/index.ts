import { ConfigService } from '@nestjs/config';
import { seedUserAwsDynamoDB } from './user.seed';

async function main() {
  const configService = new ConfigService();
  await seedUserAwsDynamoDB(configService);
}

main().catch(console.error);
