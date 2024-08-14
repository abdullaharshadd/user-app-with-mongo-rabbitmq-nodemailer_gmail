import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { TaskProducerService } from 'src/rabbit-mq/rabbit-mq-producer.service';
import { MailerService } from 'src/mailer/mailer.service';

jest.mock('axios');
jest.mock('fs');
jest.mock('path');
jest.mock('crypto');

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let taskProducerService: TaskProducerService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            updateOne: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: TaskProducerService,
          useValue: { produceTask: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    taskProducerService = module.get<TaskProducerService>(TaskProducerService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('should create a user and perform related actions', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };
      const createdUser = { id: 1, ...createUserDto };
      
      jest.spyOn(service, 'getNextSequenceValue').mockResolvedValue(1);
      jest.spyOn(userModel, 'save').mockResolvedValue(createdUser as never);

      await service.create(createUserDto);

      expect(taskProducerService.produceTask).toHaveBeenCalledWith({ user: createUserDto.email });
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        createUserDto.email, 
        'User Created', 
        'Hi, Your user have been successfully created', 
        '<h1> Hello </h1>'
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
      jest.spyOn(userModel, 'find').mockReturnThis();
      jest.spyOn(userModel, 'exec').mockResolvedValue(users as never);

      expect(await service.findAll()).toEqual(users);
    });
  });

  describe('findByID', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      jest.spyOn(userModel, 'findOne').mockResolvedValue(user as any);

      expect(await service.findByID(1)).toEqual(user);
    });
  });

  describe('findAvatarByID', () => {
    it('should return avatar for a user', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com', avatar: { base64: 'some-base64' } };
      jest.spyOn(service, 'findByID').mockResolvedValue(user as any);

      expect(await service.findAvatarByID(1)).toEqual({ avatar: 'some-base64' });
    });

    it('should fetch and save avatar if not found', async () => {
      const userId = 1;
      jest.spyOn(service, 'findByID').mockResolvedValue({ id: userId } as any);
      jest.spyOn(service, 'saveAndReturnAvatar').mockResolvedValue('some-base64');

      expect(await service.findAvatarByID(userId)).toEqual({ avatar: 'some-base64' });
    });
  });

  describe('saveAndReturnAvatar', () => {
    it('should fetch, save, and return the avatar', async () => {
      const userId = 1;
      const avatarUrl = 'https://reqres.in/api/users/1';
      const imageBuffer = Buffer.from('image data');
      const hash = 'somehash';
      const filePath = path.join(__dirname, '../../', 'uploads', `${hash}.jpg`);

      axios.get = jest.fn().mockResolvedValue({ data: { avatar: avatarUrl } });
      jest.spyOn(service, 'fetchImageAsBuffer').mockResolvedValue(imageBuffer);
      crypto.createHash = jest.fn().mockReturnValue({ update: jest.fn().mockReturnThis(), digest: jest.fn().mockReturnValue(hash) });
      fs.writeFileSync = jest.fn();

      await service.saveAndReturnAvatar(userId);

      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, imageBuffer);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { id: userId },
        { $set: { avatar: { hash, base64: imageBuffer.toString('base64') } } }
      );
    });
  });

  describe('deleteAvatarByID', () => {
    it('should delete the avatar file and metadata', async () => {
      const userId = 1;
      const user = { id: userId, avatar: { hash: 'somehash' } };
      const filePath = path.join(__dirname, '../../', 'uploads', `${user.avatar.hash}.jpg`);

      jest.spyOn(userModel, 'findOne').mockResolvedValue(user as any);
      fs.unlinkSync = jest.fn();

      await service.deleteAvatarByID(userId);

      expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { id: userId },
        { $unset: { avatar: '' } }
      );
    });
  });
});
