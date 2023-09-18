import { IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisableAccountDto {
  @ApiProperty()
  @ValidateIf((object: any, value: any) => value !== null)
  @IsNotEmpty()
  is_disabled: boolean;
}
