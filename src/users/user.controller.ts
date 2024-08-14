import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';

@Controller('/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/users")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("/users")
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get("/user/:userId")
  async findByID(@Param('userId') userId: number): Promise<User> {
    return this.userService.findByID(userId);
  }

  @Get("/user/:userId/avatar")
  async findAvatarByID(@Param('userId') userId: number): Promise<any> {
    return this.userService.findAvatarByID(userId);
  }

  @Delete("user/:userId/avatar")
  async deleteAvatarByID(@Param('userId') userId: number): Promise<void> {
    return this.userService.deleteAvatarByID(userId);
  }
}
