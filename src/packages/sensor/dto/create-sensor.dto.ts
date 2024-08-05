import { ApiProperty } from '@nestjs/swagger';

export class CreateSensorDto {
  @ApiProperty({ description: 'ID do equipamento' })
  equipmentId: string;

  @ApiProperty({ description: 'Timestamp da leitura do sensor' })
  timestamp: string;

  @ApiProperty({ description: 'Valor lido pelo sensor' })
  value: number | string;
}
