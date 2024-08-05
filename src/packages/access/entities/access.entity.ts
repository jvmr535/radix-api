import { ApiProperty } from '@nestjs/swagger';

export class Access {
  @ApiProperty({ description: 'Chave de acesso do usuário' })
  UserAccessKey: string;

  @ApiProperty({ description: 'Nome de usuário' })
  Username: string;

  @ApiProperty({ description: 'Indica se o usuário está ativo' })
  IsActive: boolean;

  @ApiProperty({ description: 'Senha do usuário' })
  Password: string;
}
