import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private nestJwtService: NestJwtService) { }

  sign(payload: any, options: JwtSignOptions): string {
    return this.nestJwtService.sign(payload, options);
  }
}
