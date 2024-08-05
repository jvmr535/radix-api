import { ApiProperty } from '@nestjs/swagger';

export class Sensor {
  @ApiProperty({ description: 'ID do Equipamento' })
  EquipmentId: string;

  @ApiProperty({ description: 'ID da Atividade' })
  ActivityId: string;

  @ApiProperty({ description: 'Timestamp' })
  Timestamp: Date;

  @ApiProperty({ description: 'Valor' })
  Value: number;
}
