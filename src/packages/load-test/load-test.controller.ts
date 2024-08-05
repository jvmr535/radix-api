import { Controller, Get } from '@nestjs/common';
import { LoadTestService } from './load-test.service';
import { Public } from 'src/decorators/public-route.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Rotas de teste de carga')
@Controller('load-test')
export class LoadTestController {
  constructor(private readonly loadTestService: LoadTestService) {}

  @Public()
  @Get()
  findAll() {
    return this.loadTestService.findAll();
  }
}
