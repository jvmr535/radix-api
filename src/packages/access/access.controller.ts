import { Controller, Post, Body } from '@nestjs/common';
import { AccessService } from './access.service';
import { Public } from 'src/decorators/public-route.decorator';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthAccess } from './entities/auth-access.entity';

@ApiTags('Rotas de login')
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Public()
  @Post('signIn')
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não foi possível realizar o login',
  })
  public async signIn(
    @Body() loginCredentials: LoginCredentialsDto,
  ): Promise<AuthAccess> {
    return await this.accessService.signIn(loginCredentials);
  }
}
