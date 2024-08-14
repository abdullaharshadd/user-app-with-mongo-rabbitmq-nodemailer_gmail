import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { TaskProducerService } from 'src/rabbit-mq/rabbit-mq-producer.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...userProviders, TaskProducerService, MailerService],
})
export class UserModule {}
