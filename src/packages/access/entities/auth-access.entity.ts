import { ApiProperty } from '@nestjs/swagger';

export class AuthAccess {
  @ApiProperty({ description: 'Token de acesso' })
  accessToken: string;
}
