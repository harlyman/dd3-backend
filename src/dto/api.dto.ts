import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GuidDTO {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  guid: string;
}

export class ArrayGuidDTO {
  @ApiProperty({ isArray: true, required: true, type: 'string' })
  @ArrayMinSize(1)
  @IsArray()
  guids: string[];
}

export class PaginationDTO {
  @ApiProperty({ required: true, default: '0' })
  @IsString()
  offset?: string = '0';

  @ApiProperty({ required: true, default: '10' })
  @IsString()
  pageSize?: string = '10';

  @ApiProperty({ required: false, type: 'string', default: 'name' })
  @IsOptional()
  @IsString()
  orderBy?: 'name' | 'lastname' | 'username' | 'cuit' | 'address' | 'period' = 'name';

  @ApiProperty({ required: false, type: 'string', default: 'ASC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'ASC';
}

export class ResponseDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: 'success' | 'error';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;
}

export class ResponseDataDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: 'success' | 'error';

  @ApiProperty({ required: false })
  @IsOptional()
  data?: any;
}

export class ResposeResultsPaginationDTO {
  @ApiProperty({ required: true })
  @IsNumber()
  total: number;

  @ApiProperty({ required: true })
  @IsNumber()
  pageSize: number;

  @ApiProperty({ required: true })
  @IsNumber()
  offset: number;

  @ApiProperty({ required: true })
  @IsNumber()
  results: any[];
}

export class ResposePaginationDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: 'success' | 'error';

  @ApiProperty({ required: false })
  @IsOptional()
  data?: ResposeResultsPaginationDTO;
}
