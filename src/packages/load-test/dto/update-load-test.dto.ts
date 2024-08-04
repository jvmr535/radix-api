import { PartialType } from '@nestjs/mapped-types';
import { CreateLoadTestDto } from './create-load-test.dto';

export class UpdateLoadTestDto extends PartialType(CreateLoadTestDto) {}
