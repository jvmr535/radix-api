import { ApiProperty } from '@nestjs/swagger';

export class CreateAccessDto {
  @ApiProperty({ description: 'Nome de usuário', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Senha', example: 'password123' })
  password: string;

  @ApiProperty({ description: 'Indica se o acesso está ativo', example: true })
  isActive: boolean;
}
