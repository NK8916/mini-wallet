import { IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty()
  @ValidateIf((object: any, value: any) => value !== null)
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @ValidateIf((object: any, value: any) => value !== null)
  @IsNotEmpty()
  reference_id: string;
}
