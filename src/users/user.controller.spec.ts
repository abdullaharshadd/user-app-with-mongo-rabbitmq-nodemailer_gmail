import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue([]),
            findByID: jest.fn().mockResolvedValue(null),
            findAvatarByID: jest.fn().mockResolvedValue(null),
            deleteAvatarByID: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const result: User = { id: 1, ...createUserDto };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      expect(await controller.findAll()).toEqual(users);
    });
  });

  describe('findByID', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      jest.spyOn(service, 'findByID').mockResolvedValue(user);

      expect(await controller.findByID(1)).toEqual(user);
    });
  });

  describe('findAvatarByID', () => {
    it('should return avatar for a user', async () => {
      const avatarData = { avatar: 'some-base64' };
      jest.spyOn(service, 'findAvatarByID').mockResolvedValue(avatarData);

      expect(await controller.findAvatarByID(1)).toEqual(avatarData);
    });
  });

  describe('deleteAvatarByID', () => {
    it('should delete the avatar', async () => {
      jest.spyOn(service, 'deleteAvatarByID').mockResolvedValue();

      await controller.deleteAvatarByID(1);

      expect(service.deleteAvatarByID).toHaveBeenCalledWith(1);
    });
  });
});
