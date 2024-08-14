import { Injectable } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import rabbitmqConfig from './rabbit-mq.config';

@Injectable()
export class TaskProducerService {
  private channel: Channel;
  
  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const connection = await connect(rabbitmqConfig.uri);
    this.channel = await connection.createChannel();
    await this.channel.assertQueue(rabbitmqConfig.queueName, { durable: true });
  }

  async produceTask(task: any): Promise<void> {
    await this.channel.sendToQueue(
      rabbitmqConfig.queueName,
      Buffer.from(JSON.stringify(task)),
      { persistent: true },
    );
  }
}