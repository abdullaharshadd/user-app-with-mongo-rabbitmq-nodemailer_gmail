import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { RabbitMQModule } from './rabbit-mq/rabbit-mq.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [UserModule, RabbitMQModule, MailerModule],
})
export class AppModule {}
