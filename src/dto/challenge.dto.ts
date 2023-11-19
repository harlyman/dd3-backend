import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class ChallengeBodyDTO {
  @ApiProperty({ required: true, maxLength: 30 })
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  user_word: string;
}

export class ChallengeResponseDTO {
  @ApiProperty({ required: true, maxLength: 1 })
  @MaxLength(1)
  @IsNotEmpty()
  @IsString()
  letter: string;

  @ApiProperty({ required: false, maxLength: 1 })
  @IsNotEmpty()
  @IsNumber()
  value: number;
}
