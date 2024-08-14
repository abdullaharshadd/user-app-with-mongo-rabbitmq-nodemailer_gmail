import { IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly email: string;

  @IsOptional() // Make avatar optional
  readonly avatar?: {
    readonly hash: string;
    readonly base64: string;
  };
};
