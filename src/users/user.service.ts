import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { TaskProducerService } from 'src/rabbit-mq/rabbit-mq-producer.service';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>, 
  private readonly taskProducerService: TaskProducerService,
  private readonly mailerService: MailerService) {}
  
  private async getNextSequenceValue(sequenceName: string): Promise<number> {
    const sequenceDocument = await this.userModel.collection.findOneAndUpdate(
      { id: sequenceName },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    return sequenceDocument.seq;
  }

  private async fetchImageAsBuffer(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data);
      return imageBuffer;
    } catch (error) {
      console.error('Error fetching the image:', error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const nextId = await this.getNextSequenceValue('userid');
    const createdUser = new this.userModel({ id: nextId, ...createUserDto });
    // Creating rabbitMQ task
    await this.taskProducerService.produceTask({user: createdUser.email});
    // Sending email
    await this.mailerService.sendMail(createdUser.email, 'User Created', 'Hi, Your user have been successfully created', '<h1> Hello </h1>');
    return createdUser.save();
  }
  
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByID(userId: number): Promise<User> {
    return this.userModel.findOne({
        id: userId
    })
  }

  async findAvatarByID(userId: number): Promise<any> {
    const user = await this.findByID(userId);
    if (user.avatar && user.avatar.base64) {
      return { 'avatar' : user.avatar.base64 };
    } else {
      // Fetch and save the avatar if not found
      return { 'avatar': await this.saveAndReturnAvatar(userId) }
    }
  }

  async saveAndReturnAvatar(userId: number): Promise<string> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    const imageBuffer = await this.fetchImageAsBuffer(response.data.data.avatar);
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const filePath = path.join(__dirname, '../../', 'uploads', `${hash}.jpg`);
    fs.writeFileSync(filePath, imageBuffer);

    // Save metadata to MongoDB
    await this.userModel.updateOne(
      { id: userId },
      { $set: { avatar: { hash, base64: imageBuffer.toString('base64') } } }
    ).exec();

    return imageBuffer.toString('base64');
  }


  async deleteAvatarByID(userId: number): Promise<void> {
    const user = await this.userModel.findOne({id: userId}).exec();
    if (user.avatar) {
      const filePath = path.join(__dirname, '../../', 'uploads', `${user.avatar.hash}.jpg`);
      fs.unlinkSync(filePath);
      
      // Remove metadata from MongoDB
      await this.userModel.updateOne(
        { id: userId },
        { $unset: { avatar: '' } }
      ).exec();
    }
  }
}
