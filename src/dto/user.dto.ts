import { ApiProperty, PartialType } from '@nestjs/swagger';

import { ArrayMinSize, IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RoleEnum } from 'src/entities/roles.entity';
import { PaginationDTO } from './api.dto';

export class LoginDTO {
  @ApiProperty({ required: true })
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: true })
  @MinLength(3)
  @MaxLength(70)
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserCreateDTO {
  @ApiProperty({ required: true })
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: true })
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ required: true })
  @MinLength(3)
  @MaxLength(70)
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ required: true, enum: RoleEnum, type: 'string' })
  @IsNotEmpty()
  @IsEnum(RoleEnum, { each: true })
  roleGuid: string;
}

export class UserSignUpDTO {
  @ApiProperty({ required: true })
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: true })
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({ required: true })
  @MinLength(3)
  @MaxLength(70)
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserUpdateDTO extends PartialType(UserCreateDTO) {}

export class UserSearchDTO {
  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  guid?: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  password?: string;
}

export class UserSearchPaginationDTO extends PaginationDTO {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  guid?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ type: 'boolean', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  roleGuid?: string;

  @ApiProperty({ isArray: true, required: false, type: 'string' })
  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  roleGuids?: string[];

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  createdByGuid?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  updatedByGuid?: string;

  @ApiProperty({ required: false, type: 'string', default: 'name' })
  @IsOptional()
  @IsString()
  orderBy?: 'name' | 'lastname' | 'username' = 'name';
}
