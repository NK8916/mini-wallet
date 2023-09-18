import { IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntitializeAccountDto {
  @ApiProperty()
  @ValidateIf((object: any, value: any) => value !== null)
  @IsNotEmpty()
  customer_xid: string;
}
