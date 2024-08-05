import { ApiProperty } from '@nestjs/swagger';

export class SensorAverage {
  @ApiProperty({ description: 'Período da média do sensor' })
  period: string;

  @ApiProperty({ description: 'Valor da média do sensor' })
  value: number;
}
