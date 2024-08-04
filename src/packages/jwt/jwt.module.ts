import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as JwtModuleNest } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/domains/enums';

@Module({
  providers: [JwtService],
  imports: [
    JwtModuleNest.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EnvKeys.JWT_SECRET),
      }),
    }),
  ],
  exports: [JwtService],
})
export class JwtModule { }
