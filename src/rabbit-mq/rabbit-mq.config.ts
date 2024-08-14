import { config } from 'dotenv';
config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const rabbitmq_queue_name = process.env.RABBITMQ_QUEUE_NAME;
export default {
  uri: rabbitmq_url ? rabbitmq_url : 'amqp://guest:guest@localhost:5672/',
  queueName: rabbitmq_queue_name ? rabbitmq_queue_name : 'user_created_queue'
};