import { Controller, Get } from '@nestjs/common';
import { LoadTestService } from './load-test.service';
import { Public } from 'src/decorators/public-route.decorator';

@Controller('load-test')
export class LoadTestController {
  constructor(private readonly loadTestService: LoadTestService) { }

  @Public()
  @Get()
  findAll() {
    return this.loadTestService.findAll();
  }
}
