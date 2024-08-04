import { Module } from '@nestjs/common';
import { LoadTestService } from './load-test.service';
import { LoadTestController } from './load-test.controller';

@Module({
  controllers: [LoadTestController],
  providers: [LoadTestService],
})
export class LoadTestModule {}
