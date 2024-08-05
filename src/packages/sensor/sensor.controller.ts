import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SensorAverage } from './entities/sensor-average.entity';
import { Sensor } from './entities/sensor.entity';

@ApiTags('Rotas de sensor')
@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Dados dos sensores retornados com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autorizado a acessar esses dados',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possível retornar os dados dos sensores',
  })
  public async getSensorAveragesData(
    @Query('equipmentId') equipmentId: string,
  ): Promise<SensorAverage[]> {
    return await this.sensorService.getSensorAveragesData(equipmentId);
  }

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Atividade de sensor criada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autorizado a criar esse dado',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possível criar a atividade do sensor',
  })
  public async createSensorData(
    @Body() createSensorDto: CreateSensorDto,
  ): Promise<Sensor> {
    return await this.sensorService.createSensorData(createSensorDto);
  }

  @Post('csv')
  @ApiResponse({
    status: 200,
    description: 'Atividades de sensores criadas com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autorizado a criar esses dados',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possível criar as atividades dos sensores',
  })
  @UseInterceptors(FileInterceptor('file'))
  public async createFromCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Sensor[]> {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    return await this.sensorService.createSensorDataFromCsv(file);
  }
}
