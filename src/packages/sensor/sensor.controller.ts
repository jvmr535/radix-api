import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { PeriodAveragesEnum } from 'src/domains/enums';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) { }

  @Get()
  public async getSensorData(@Query('period') period: PeriodAveragesEnum) {
    return this.sensorService.getSensorData(period);
  }

  @Post()
  public async createSensorData(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorService.createSensorData(createSensorDto);
  }

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  public async createFromCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    return this.sensorService.createSensorDataFromCsv(file);
  }
}
