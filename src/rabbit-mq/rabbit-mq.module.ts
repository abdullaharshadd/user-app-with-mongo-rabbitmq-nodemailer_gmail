import { Module } from '@nestjs/common';
import { TaskProducerService } from './rabbit-mq-producer.service';

@Module({
  imports: [
    
  ],
  providers: [
    TaskProducerService
  ],
})
export class RabbitMQModule {}