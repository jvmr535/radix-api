import { ApiProperty } from '@nestjs/swagger';

export class LoginCredentialsDto {
  @ApiProperty({ description: 'Nome de usuário', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Senha', example: 'password123' })
  password: string;
}
