import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadTestService {
  findAll() {
    return `This action returns all loadTest`;
  }
}
