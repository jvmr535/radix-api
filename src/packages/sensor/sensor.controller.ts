import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) { }

  @Post()
  public async create(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorService.create(createSensorDto);
  }
}
