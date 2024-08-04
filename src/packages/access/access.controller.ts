import { Controller, Post, Body } from '@nestjs/common';
import { AccessService } from './access.service';
import { Public } from 'src/decorators/public-route.decorator';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) { }

  @Public()
  @Post('signIn')
  public async signIn(@Body() loginCredentials: LoginCredentialsDto) {
    return this.accessService.signIn(loginCredentials);
  }
}
